
# Customizable-RAG-Agentic-AI
A full-stack framework for building modular Retrieval-Augmented Generation (RAG) pipelines and agentic AI workflows. Users can upload documents or connect databases or api endpoint for context-aware Q&A with stateful conversations, automate tasks like scheduling meetings or processing Excel inputs, and trigger multi-step actions through intelligent agents.





## Installation

Clone the repository:  
```bash
git clone https://github.com/astitva3110/Customizable-RAG-Agentic-AI-.git
cd Customizable-RAG-Agentic-AI-
```

Client (React)
```bash
cd client
npm install
npm run dev
```
Server (Django)
```bash
# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate   # Mac/Linux
venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start the Django server
python manage.py runserver
```
## Tech Stack

- *Server*: Django REST Framework (Python)  
- *Frontend*: React  
- *Databases*: PostgreSQL & Chroma (vector DB for RAG)  
- *AI/LLM*: Google Gemini GenAI API  
- *Orchestration / Agents*: LangChain & LangGraph  
- *Automation*: n8n  
## Features

- *Retrieval-Augmented Generation (RAG)* pipeline with vector search (Chroma)  
- *Agentic workflows* for dynamic task orchestration  
- *Customizable knowledge ingestion* (documents, PDFs, structured data)  
- *Conversational AI* with context-aware responses powered by Google Gemini  
- *REST APIs* built on Django REST Framework for seamless integration  
- *Frontend* in React for interactive user experience  

### Future Improvements Ideas

- Add *multi-agent automation* for collaborative workflows  
- Integrate *LlamaIndex* for advanced document indexing and query optimization  
- Implement *observability tools* for monitoring RAG pipeline performance  
  
