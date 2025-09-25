#!/usr/bin/env python
# coding: utf-8

# In[14]:



import dotenv
dotenv.load_dotenv()


# In[15]:



import docx2txt
import requests
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader
from typing import List
from langchain.schema import Document
from pymongo import MongoClient
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
import os
import uuid
import chromadb


# In[16]:


def get_chroma_client(api_key: str, tenant: str, database: str):
    try:
        client = chromadb.CloudClient(
            api_key=api_key,
            tenant=tenant,
            database=database
        )
        print("Successfully connected to Chroma Cloud!")
        return client
    except Exception as e:
        print(f" Error connecting to Chroma Cloud: {e}")
        return None


# In[17]:


def document_loader(file_path:str)-> List[Document]:
    ext=os.path.splitext(file_path)[-1].lower()
    try:
        if ext==".pdf":
            loader = PyPDFLoader(file_path)
        elif ext==".docx":
            loader=Docx2txtLoader(file_path)
        elif ext==".txt":
            loader=TextLoader(file_path)
        else:
            print(f"Skipping unsupported file: {file_path}")
            return None
        return loader.load()
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return None


# In[18]:


def load_from_api(endpoint_url: str):
    try:
        response = requests.get(endpoint_url)
        response.raise_for_status()
        data = response.json()  
    except Exception as e:
        print(f"Error fetching data: {e}")
        return []

    documents = []
    if isinstance(data, list):
        for idx, item in enumerate(data):
            documents.append(Document(page_content=str(item), metadata={"source": endpoint_url, "index": idx}))
    else:
        documents.append(Document(page_content=str(data), metadata={"source": endpoint_url}))

    return documents


# In[19]:


def load_from_mongodb(connection_uri: str, db_name: str, collection_name: str, query: dict = {}):
    docs = []
    try:
        client = MongoClient(connection_uri)
        collection = client[db_name][collection_name]
        results = collection.find(query)

        for r in results:
            docs.append(Document(page_content=str(r), metadata={"collection": collection_name}))
    except Exception as e:
        print(f"MongoDB error: {e}")

    return docs




def splitter(docs: List[Document], chunk_size=500, chunk_overlap=100):
    if not docs:
        return []
    
    
    combined_text = "\n".join(doc.page_content for doc in docs)
    docs = [Document(page_content=combined_text)]  
    

    splitters = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    return splitters.split_documents(docs)


def embedings_store(docs, client, collection_name=None):
    if collection_name is None:
        collection_name = f"collection_{uuid.uuid4().hex[:8]}"

    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")

    ids, metadatas, contents = [], [], []
    for idx, doc in enumerate(docs):
        ids.append(str(idx))
        
       
        metadata = doc.metadata if doc.metadata else {"source": "unknown"}
        metadatas.append(metadata)
        
        contents.append(doc.page_content)

    try:
        vectors = embeddings.embed_documents(contents) 
    except Exception as e:
        raise RuntimeError(f"Embedding failed: {e}")

    vectorstore = Chroma(
        client=client,
        collection_name=collection_name,
        embedding_function=None  
    )

    vectorstore._collection.upsert(
        ids=ids,
        embeddings=vectors,
        metadatas=metadatas,
        documents=contents
    )

    return collection_name





# In[24]:


def process_and_store(
    source_type: str,
    client,
    file_path: str = None,
    endpoint_url: str = None,
    mongo_uri: str = None,
    db_name: str = None,
    collection_name: str = None,
    query: dict = {},
    chroma_collection_name: str = None
):
    
    docs = []
    if source_type == "file" and file_path:
        docs = document_loader(file_path)
    elif source_type == "api" and endpoint_url:
        docs = load_from_api(endpoint_url)
    elif source_type == "mongodb" and mongo_uri and db_name and collection_name:
        docs = load_from_mongodb(mongo_uri, db_name, collection_name, query)
    else:
        print("Invalid source or missing parameters")
        return None, []

   
    docs = splitter(docs)

   
    return embedings_store(docs, client, chroma_collection_name)




