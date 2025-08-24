"use client";

import classNames from "classnames";
import { useState, useRef, useEffect } from "react";
import { MoonLoader, SyncLoader } from "react-spinners";
import TextareaAutosize from "react-textarea-autosize";
import { formatTimeWithAmPm, getFunkyGreeting, getUrl } from "./utils";
import { Message, QueryResponse, UploadResponse } from "./types";
import {
  DocumentIcon,
  PinIcon,
  SendIcon,
  TickIcon,
  WarningIcon,
} from "./SvgIcons";

const greetingMessage = getFunkyGreeting();

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (uploadMessage) {
      setTimeout(() => {
        setUploadMessage("");
        setUploadStatus("idle")
      }, 5000);
    }
  }, [uploadMessage]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (
      !file.name.toLowerCase().endsWith(".pdf") &&
      !file.name.toLowerCase().endsWith(".txt")
    ) {
      setUploadStatus("error");
      setUploadMessage("Please upload only PDF or TXT files");
      return;
    }

    setUploadStatus("uploading");
    setUploadMessage("Uploading document...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(getUrl("/api/documents/upload"), {
        method: "POST",
        body: formData,
      });

      const result: UploadResponse = await response.json();

      if (response.ok && result.data.success) {
        setDocumentId(result.data.document_id);
        setUploadStatus("success");
        setUploadMessage(
          `Document "${result.data.filename}" uploaded successfully!`
        );

        // Add a system message
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: "assistant",
            content: `Document "${result.data.filename}" has been uploaded and is ready for queries. You can now ask questions about this document.`,
            timestamp: new Date(),
            isUploadedFile: true,
          },
        ]);
      } else {
        setUploadStatus("error");
        setUploadMessage(result.message || "Upload failed");
      }
    } catch (error) {
      setUploadStatus("error");
      setUploadMessage("Failed to upload document. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("query", inputValue);
      formData.append("k", "1"); // number of results
      if (documentId) {
        formData.append("document_id", documentId);
      }

      const response = await fetch(getUrl("/api/documents/query"), {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        const message = result.data as QueryResponse;
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: message.answer || "No answer found.",
          sources: message.sources,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: `Error: ${result.detail || "Failed to get response"}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Failed to connect to the server. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const isUploading = uploadStatus === "uploading";

  const fileUpload = () => {
    if (uploadStatus === "uploading") {
      return (
        <div className="flex items-center gap-x-2 p-2 transition-all">
          <MoonLoader color="#fff" size={13} />
          <p className="py-1 text-sm text-gray-500">{uploadMessage}</p>
        </div>
      );
    }

    if (uploadStatus === "success") {
      return (
        <div className="flex items-center gap-x-2 p-2 transition-all">
          <TickIcon classes="size-4 text-green-500" />
          <p className="py-1 text-sm text-gray-300">{uploadMessage}</p>
        </div>
      );
    }

    if (uploadStatus === "error") {
      return (
        <div className="flex items-center gap-x-2 p-2 text-red-500 transition-all">
          <WarningIcon classes="size-4" />
          <p className="py-1 text-sm">{uploadMessage}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Messages Container */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-300 mt-20 space-y-10">
              <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-2xl">
                  <DocumentIcon classes="size-10" />
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-200">
                {greetingMessage}
              </h2>
              <p className="text-lg">
                What&apos;s on{" "}
                <span className="text-gray-500 font-semibold">your mind</span>?
              </p>

              <div className="p-4 rounded-xl w-fit max-w-2xl mx-auto space-y-5">
                <p className="text-gray-400">
                  Upload your PDF or Text files and instantly get answers based
                  on their content. Powered by Retrieval-Augmented Generation
                  (RAG), our system combines intelligent document retrieval with
                  advanced AI to deliver accurate, context-aware responses in
                  real time.
                </p>

                {/* <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-black text-white text-sm rounded-full hover:bg-black/90"
                >
                  Upload Your First Document
                </button> */}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-xl ${
                    message.type === "user"
                      ? "bg-linear-15 from-black to-[#0a0a0a] text-white"
                      : "text-white"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div
                    className={classNames(
                      "flex items-center gap-x-3 text-xs mt-2",
                      {
                        "text-gray-400": message.type === "user",
                        "text-gray-500": message.type !== "user",
                      }
                    )}
                  >
                    <div>{formatTimeWithAmPm(message.timestamp)}</div>

                    {message.type === "assistant" ? (
                      <div
                        className={classNames(
                          "p-[1px] rounded-full inline-block",
                          {
                            "bg-gradient-to-r from-cyan-500 to-red-500":
                              !message?.isUploadedFile,
                          }
                        )}
                      >
                        {message?.isUploadedFile ? (
                          <div className="bg-black text-gray-300 rounded-full px-2 py-0.5 flex items-center gap-x-2">
                            <TickIcon classes="size-4 text-green-500" />
                            <span>File uploaded</span>
                          </div>
                        ) : (
                          <div className="bg-black text-gray-300 rounded-full px-2 py-0.5">
                            {`sources: ${
                              message?.sources?.length
                                ? message.sources.join(",")
                                : "global search"
                            }`}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start px-4 py-3">
              <SyncLoader size={8} color="#fff" />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Input Form */}
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {fileUpload()}
          <div className="bg-linear-15 from-black to-[#0a0a0a] border border-[#181818]/20 rounded-2xl p-3">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex-1">
                <TextareaAutosize
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your question..."
                  disabled={isLoading || isUploading}
                  minRows={1}
                  maxRows={7}
                  className="w-full px-3 py-2 border-0 focus:outline-none focus:ring-0 text-gray-00 placeholder-gray-600 disabled:opacity-50 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#181818]/20">
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || isUploading}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-200 transition-colors disabled:opacity-50"
                  >
                    <PinIcon />
                    <span className="text-sm font-medium">Attach</span>
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="submit"
                    disabled={
                      !inputValue.trim() ||
                      isLoading ||
                      uploadStatus === "uploading"
                    }
                    className="w-10 h-8 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    <SendIcon />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
