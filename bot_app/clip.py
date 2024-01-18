from PIL import Image
import torch
import clip
import numpy as np
import faiss
import os
import pickle
from tqdm import tqdm

device = "cuda" if torch.cuda.is_available() else "cpu"

def build_embeddings(model, preprocess, data_dir, save_dir): 
    # read all image names
    images = []
    for root, dirs, files in os.walk(data_dir): 
        for file in files: 
                images.append(root  + '/'+ file) 

    # define the emb variable to store embeddings
    embeddings = []

    # extract embeddings and store them in the emb variable
    for i in tqdm(range(len(images))):
        with torch.no_grad():
            image = preprocess(Image.open(images[i])).unsqueeze(0).to(device)
            image_features = model.encode_image(image)
            embeddings.append(image_features.detach().cpu().numpy()) 

    data = {"image_paths": images, "embeddings": embeddings}
    with open(save_dir, 'wb') as f:
        pickle.dump(data, f, protocol=4) 


def build_index(file_dir, save_dir="vector.index"): 
    with open(file_dir, 'rb') as f:
        data = pickle.load(f) 

    # create Faiss index using FlatL2 
    embeddings = np.array(data["embeddings"], dtype=np.float32) 
    index = faiss.index_factory(embeddings.shape[1], "Flat", faiss.METRIC_INNER_PRODUCT) 
    index.train(embeddings) 
    index.add(embeddings) 

    # store the index locally
    faiss.write_index(index, save_dir) 

def search(model, preprocess, file_dir, index_dir, model_input, input_type, top_k): 
    index  = faiss.read_index(index_dir) 

    if input_type == "image": 
        image = Image.open(model_input) 
        image = preprocess(image).unsqueeze(0).to(device)
        with torch.no_grad():
            features = model.encode_image(image.to(device)) 
    else: 
        with torch.no_grad():
            text = clip.tokenize([model_input]).to(device)
            features = model.encode_text(text)

    # preprocess the tensor
    embeddings = features.detach().cpu().numpy().astype(np.float32)
    faiss.normalize_L2(embeddings)

    # search the top k images 
    probs, indices = index.search(embeddings, top_k) 

    # load images 
    with open(file_dir, 'rb') as f:
        data = pickle.load(f) 
    image_paths = data["image_paths"] 
    
    # return image_paths[indices[0, 0]]
    print(indices[0, 0])
    return image_paths[indices[0, 0]]