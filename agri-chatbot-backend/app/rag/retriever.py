from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import SentenceTransformerEmbeddings

# Path where FAISS index is saved
VECTOR_DIR = "vectorstore/maharashtra_faiss"

# Load embeddings model (must be SAME as ingest.py)
embeddings = SentenceTransformerEmbeddings(
    model_name="all-MiniLM-L6-v2"
)

# Load FAISS vector store
vectorstore = FAISS.load_local(
    VECTOR_DIR,
    embeddings,
    allow_dangerous_deserialization=True
)

def retrieve_context(query: str, k: int = 4) -> str:
    """
    Retrieve relevant Maharashtra-specific agriculture context
    from FAISS vector store.
    """
    docs = vectorstore.similarity_search(query, k=k)

    context = "\n\n".join([doc.page_content for doc in docs])

    return context
