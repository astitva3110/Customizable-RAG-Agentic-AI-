from django.urls import path
from .views import RAGIngestView  # adjust path if views are in a different app

urlpatterns = [
    path("upload/",  RAGIngestView.as_view(), name="rag_ingest")
]