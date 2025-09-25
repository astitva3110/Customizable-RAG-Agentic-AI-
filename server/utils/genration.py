#!/usr/bin/env python
# coding: utf-8

# In[10]:






# In[11]:

import os
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from typing_extensions import TypedDict
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
import chromadb
from typing import TypedDict, List, Dict, Any
from langchain_core.runnables import Runnable
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.callbacks.base import BaseCallbackHandler
import dotenv
dotenv.load_dotenv()


# In[12]:


SIMILARITY_THRESHOLD = 0.65

def make_user_retriever(collection_names: list[str], k: int = 3):
    """
    Returns a retriever that queries across multiple Chroma collections for one user.
    Filters documents based on a similarity threshold.
    """
    try:
        cloud_client = chromadb.CloudClient(
            api_key="ck-Dz6qp9edtXJ4tp8uSDkHxKSSSMDLW1mbwK6UgNJ8h78W",
            tenant="440b6fee-57fb-4c44-a43a-037124a377ce",
            database="Project"
        )

        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")

        retrievers = []

        for name in collection_names:
            chroma_client = Chroma(
                client=cloud_client,
                collection_name=name,
                embedding_function=embeddings
            )
            retrievers.append(chroma_client)  # store Chroma client, not retriever yet

        def filtered_retrieve(query: str):
            all_results = []
            for chroma_client in retrievers:
                docs_with_scores = chroma_client.similarity_search_with_score(query, k=k)
                # docs_with_scores -> List of (Document, float_score)
                for doc, score in docs_with_scores:
                    if score >= SIMILARITY_THRESHOLD:
                        all_results.append(doc)
            return all_results

        return filtered_retrieve

    except Exception as e:
        print(f"❌ Error connecting retriever: {e}")
        return None


# In[13]:


class RagState(TypedDict):
    question:str
    context:str
    answer:str
    history: List[Dict[str, str]]



def make_retrieve_node(retriever):
    def retrieve_node(state: RagState):
        query = state["question"]
        docs = retriever(query) if retriever else []
        context = "\n\n".join([doc.page_content for doc in docs]) if docs else ""

        return {
            "context": context,
            "question": state["question"],
            "history": state.get("history", [])  
        }
    return retrieve_node


# In[48]:


def generation_node(state: RagState, chat):
    context = state["context"]
    question = state["question"]
    history = state.get("history", [])
    recent_history = history[-3:]

    history_text = "\n".join(
        [f"Human: {h['q']}\nAI: {h['a']}" for h in recent_history]
    )

    system_prompt = (
        "You are omi, a helpful AI assistant. "
        "If the retrieved context is relevant, use it. "
        "If it is incomplete or irrelevant, fall back to your own knowledge. "
        "Always provide the most accurate, clear, and factual answer."
    )

    human_prompt = f"""
Conversation so far:
{history_text}

Retrieved Context:
{context if context else "No relevant docs"}

Question:
{question}
"""

    answer = ""
    try:
        for chunk in chat.stream([
            SystemMessage(content=system_prompt),
            HumanMessage(content=human_prompt)
        ]):
            token = chunk.content or ""
            answer += token
    except Exception as e:
        answer = f"Error generating answer: {e}"

    new_history = history + [{"q": question, "a": answer}]

    return {
        "question": question,
        "context": context,
        "answer": answer.strip(),
        "history": new_history
    }


# In[49]:

class TokenCaptureCallback(BaseCallbackHandler):
    def __init__(self):
        self.tokens = []

    def on_llm_new_token(self, token: str, **kwargs):
        print(token, end="", flush=True)  # prints live tokens
        self.tokens.append(token)


# In[50]:


def build_rag_app(user_collections: List[str]):
    retriever = make_user_retriever(user_collections)

    chat = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        temperature=0,
        disable_streaming=False,
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )

    graph = StateGraph(dict)  # Use simple dict as state
    graph.add_node("retrieve", make_retrieve_node(retriever))
    graph.add_node("generate", lambda s: generation_node(s, chat))
    graph.set_entry_point("retrieve")
    graph.add_edge("retrieve", "generate")
    graph.add_edge("generate", END)

    return graph, chat


# In[51]:




# In[ ]:





# In[ ]:





# In[ ]:





# In[ ]:





# In[ ]:




