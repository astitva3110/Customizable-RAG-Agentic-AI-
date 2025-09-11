from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
import tempfile
import os
import dotenv
dotenv.load_dotenv()
# import your pipeline helpers
from utils.loader import (
    get_chroma_client,
    document_loader,
    load_from_api,
    load_from_mongodb,
    splitter,
    embedings_store
)


class RAGIngestView(APIView):
    def post(self, request):
        """
        Accepts a doc file OR endpoint URL OR MongoDB string,
        then loads, splits, embeds, and stores in Chroma Cloud.
        Returns collection name + inserted IDs.
        """
        try:
            source_type = request.data.get("source_type")  # "file", "api", "mongodb"
            chroma_collection = request.data.get("chroma_collection")  # optional
            
            client = get_chroma_client(
                api_key=os.getenv("api_key"),
                tenant=os.getenv("tenant"),
                database="project"
            )

            docs = []

            # 1. Handle File Upload
            if source_type == "file" and "doc" in request.FILES:
                uploaded_file = request.FILES["doc"]
                with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                    for chunk in uploaded_file.chunks():
                        temp_file.write(chunk)
                    temp_file_path = temp_file.name
                docs = document_loader(temp_file_path)
                os.remove(temp_file_path)  # delete after processing

            # 2. Handle API Endpoint
            elif source_type == "api":
                endpoint_url = request.data.get("endpoint_url")
                docs = load_from_api(endpoint_url)

            # 3. Handle MongoDB
            elif source_type == "mongodb":
                mongo_uri = request.data.get("mongo_uri")
                db_name = request.data.get("db_name")
                collection_name = request.data.get("collection_name")
                query = request.data.get("query", {})
                docs = load_from_mongodb(mongo_uri, db_name, collection_name, query)

            else:
                return Response({
                    "status": "400",
                    "message": "Invalid source_type or missing parameters",
                    "data": {}
                })

            # 4. Split & Embed
            docs = splitter(docs)
            collection_name, ids = embedings_store(
                docs, client, chroma_collection_name=chroma_collection
            )

            return Response({
                "status": "200",
                "message": "Docs processed and embedded successfully",
                "data": {
                    "collection_name": collection_name,
                    "ids": ids
                }
            })

        except Exception as e:
            print("Error in RAGIngestView:", e)
            return Response({
                "status": "500",
                "message": str(e),
                "data": {}
            })
