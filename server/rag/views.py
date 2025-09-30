from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
import tempfile
import os
import dotenv
dotenv.load_dotenv()
from utils.loader import (
    get_chroma_client,
    document_loader,
    load_from_api,
    load_from_mongodb,
    splitter,
    embedings_store
)
from utils.genration import build_rag_app,generation_node, make_user_retriever, make_retrieve_node
import asyncio
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import StreamingHttpResponse
from langchain_google_genai import ChatGoogleGenerativeAI



class RAGIngestView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            user= request.user
            print("User payload:", user)
            try:
                asyncio.get_running_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)

            print(os.getenv("api_key"))
            print(os.getenv("tenant"))

            source_type = request.data.get("source_type")
            chroma_collection = request.data.get("chroma_collection")

            client = get_chroma_client(
                api_key=os.getenv("api_key"),
                tenant=os.getenv("tenant"),
                database="Project"
            )

            if not client:
                return Response({"status": "500", "message": "Failed to connect to Chroma", "data": {}})

            docs = []
            if source_type == "file" and "doc" in request.FILES:
                uploaded_file = request.FILES["doc"]

                original_ext = os.path.splitext(uploaded_file.name)[-1]
                with tempfile.NamedTemporaryFile(delete=False, suffix=original_ext) as temp_file:
                    for chunk in uploaded_file.chunks():
                        temp_file.write(chunk)
                    temp_file_path = temp_file.name

                docs = document_loader(temp_file_path)
                os.remove(temp_file_path) 
            elif source_type == "api":
                endpoint_url = request.data.get("endpoint_url")
                docs = load_from_api(endpoint_url)
            elif source_type == "mongodb":
                mongo_uri = request.data.get("mongo_uri")
                db_name = request.data.get("db_name")
                collection_name = request.data.get("collection_name")
                query = request.data.get("query", {})
                docs = load_from_mongodb(mongo_uri, db_name, collection_name, query)
            else:
                return Response({"status": "400", "message": "Invalid source_type or missing parameters", "data": {}})

            docs = splitter(docs)
            collection_name = embedings_store(docs, client)
            user.docs.append(collection_name)
            user.save()
            return Response({
                "status": "200",
                "message": "Docs processed and embedded successfully",
                "data": {"collection_name": collection_name}
            })

        except Exception as e:
            print("Error in RAGIngestView:", e)
            return Response({"status": "500", "message": str(e), "data": {}})



class RAGQueryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        question = request.data.get("question")
        history = request.data.get("history", [])

        if not question:
            return Response({"error": "Question is required"}, status=400)

        user = request.user
        user_collections = user.docs or []

        retriever = make_user_retriever(user_collections)
        chat = ChatGoogleGenerativeAI(
            model="gemini-1.5",
            temperature=0,
            google_api_key=os.getenv("GOOGLE_API_KEY"),
            disable_streaming=False
        )

        retrieve_fn = make_retrieve_node(retriever)
        state = {"question": question, "history": history}
        state = retrieve_fn(state)

        result = generation_node(state, chat)

        return Response({
            "question": question,
            "context": result["context"],
            "answer": result["answer"],
            "history": result["history"],  
        })

