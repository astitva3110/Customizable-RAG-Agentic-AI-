#!/usr/bin/env python
# coding: utf-8

# In[14]:



import dotenv
dotenv.load_dotenv()


# In[15]:


import os
import docx2txt
import requests
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader
from typing import List
from langchain.schema import Document
from pymongo import MongoClient
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
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





def splitter(docs: List[Document], chunk_size=500, chunk_overlap=100) -> List[Document]:
    try:
        if not docs:
            return []
        avg_length = sum(len(doc.page_content) for doc in docs) / len(docs)
        if avg_length > chunk_size:
            splitters = RecursiveCharacterTextSplitter(
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap
            )
            return splitters.split_documents(docs)
        else:
            return docs
    except Exception as e:
        print(f"Error from splitter: {e}")
        return []


# In[23]:


def embedings_store(docs: List[Document], client, collection_name: str = None):
    if not docs:
        return None, []
    try:
        if collection_name is None:
            collection_name = f"collection_{uuid.uuid4().hex[:8]}"

        # Use API key from env
        embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )

        ids, metadatas, contents = [], [], []
        for idx, doc in enumerate(docs):
            ids.append(str(idx))
            metadatas.append(doc.metadata or {})
            contents.append(doc.page_content)

        
        vectorstore = Chroma(
            client=client,
            collection_name=collection_name,
            embedding_function=embeddings   
        )

        vectorstore.add_texts(
            texts=contents,
            metadatas=metadatas,
            ids=ids
        )

        print(f" Stored {len(docs)} docs in collection: {collection_name}")
        return collection_name, ids

    except Exception as e:
        print(f" Error embedding & storing docs: {e}")
        return None, []




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
    # Load documents
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

    # Split documents
    docs = splitter(docs)

    # Embed & Store
    return embedings_store(docs, client, chroma_collection_name)


# In[25]:




# In[13]:


# In[ ]:




