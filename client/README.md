# Ask Docs - Frontend

A ChatGPT-like UI for querying documents using AI-powered search.

## Features

- **Document Upload**: Upload PDF and TXT files
- **Chat Interface**: Ask questions about uploaded documents
- **Real-time Responses**: Get instant answers from your documents
- **Simple UI**: Clean, intuitive interface similar to ChatGPT

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

## Usage

1. **Upload a Document**:
   - Click the "Upload Document" button in the header
   - Select a PDF or TXT file
   - Wait for the upload to complete

2. **Ask Questions**:
   - Once a document is uploaded, you can start asking questions
   - Type your question in the input field at the bottom
   - Press Enter or click "Send" to get an answer

3. **View Conversation**:
   - All questions and answers are displayed in a chat-like interface
   - Messages are timestamped for easy reference

## API Integration

The frontend connects to the backend API at `http://localhost:8000`:

- `POST /api/documents/upload` - Upload documents
- `POST /api/documents/query` - Query documents

## Supported File Types

- PDF files (.pdf)
- Text files (.txt)

## Development

- Built with Next.js 15 and React 19
- Styled with Tailwind CSS
- TypeScript for type safety
- Responsive design for mobile and desktop

## Prerequisites

Make sure the backend server is running on `http://localhost:8000` before using the frontend.
