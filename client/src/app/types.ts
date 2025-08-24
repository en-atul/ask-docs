export interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: string[];
  isUploadedFile?: boolean;
}

export interface QueryResponse {
  success: boolean;
  query: string;
  answer: string;
  search_type: string;
  total_results: number;
  sources: string[];
}

export interface UploadResponse {
  message: string;
  data: {
    document_id: string;
    filename: string;
    success: boolean;
  };
}
