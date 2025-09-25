from django.urls import path
from .views import RAGIngestView
from .views import RAGQueryView  

urlpatterns = [
    path("upload/",  RAGIngestView.as_view(), name="rag_ingest"),
    path("chat/",  RAGQueryView.as_view(), name="rag_chat")  
]