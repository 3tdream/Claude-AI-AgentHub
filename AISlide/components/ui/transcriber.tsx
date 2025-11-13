"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Sparkles } from "lucide-react";
import { Conversation } from "@/lib/conversations";

/**
* Decide if a conversation item should be displayed or filtered out.
* Show messages that are either:
* - Non-final (in progress)
* - Final with non-empty text
*/
function shouldDisplayMessage(message: Conversation): boolean {
  // Always show non-final messages (for loading indicators)
  if (!message.isFinal) return true;

  // For final messages, only show if they have content
  return !!(message.text && message.text.trim() !== '');
}

/**
* Typing indicator component - ChatGPT style
*/
function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center px-4 py-3">
      <motion.div
        className="w-2 h-2 bg-teal-400 rounded-full"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className="w-2 h-2 bg-teal-400 rounded-full"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className="w-2 h-2 bg-teal-400 rounded-full"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
      />
    </div>
  );
}

/**
* Single conversation item - ChatGPT style
*/
function ConversationItem({ message }: { message: Conversation }) {
 const isUser = message.role === "user";
 const isAssistant = message.role === "assistant";

 return (
   <motion.div
     initial={{ opacity: 0, y: 10 }}
     animate={{ opacity: 1, y: 0 }}
     exit={{ opacity: 0, y: -10 }}
     transition={{ duration: 0.3, ease: "easeOut" }}
     className={`w-full ${isAssistant ? "bg-gradient-to-b from-teal-50/30 to-transparent" : ""}`}
   >
     <div className="max-w-3xl mx-auto px-4 py-6">
       <div className="flex gap-4 items-start">
         {/* Avatar */}
         <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shadow-sm ${
           isUser
             ? "bg-blue-500 text-white"
             : "bg-teal-500 text-white"
         }`}>
           {isUser ? <User className="w-5 h-5" /> : "K"}
         </div>

         {/* Message Content */}
         <div className="flex-1 space-y-2 min-w-0">
           {/* Role label */}
           <div className="text-xs font-semibold text-gray-600">
             {isUser ? "You" : "Kaia"}
           </div>

           {/* Message text or typing indicator */}
           <div className="text-sm text-gray-800 leading-relaxed break-words">
             {isUser && !message.isFinal && !message.text && (
               <span className="text-gray-400 italic">Listening...</span>
             )}

             {isUser && !message.isFinal && message.text && (
               <span className="text-gray-600">{message.text}</span>
             )}

             {isUser && message.isFinal && message.text && (
               <span>{message.text}</span>
             )}

             {isAssistant && !message.isFinal && (
               <TypingIndicator />
             )}

             {isAssistant && message.text && (
               <div className="prose prose-sm max-w-none">
                 {message.text}
               </div>
             )}
           </div>
         </div>
       </div>
     </div>
   </motion.div>
 );
}

interface TranscriberProps {
 conversation: Conversation[];
}


export default function Transcriber({ conversation }: TranscriberProps) {
 const scrollRef = React.useRef<HTMLDivElement>(null);
 // Scroll to bottom whenever conversation updates
 React.useEffect(() => {
   if (scrollRef.current) {
     scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
   }
 }, [conversation]);

 // Get all displayable messages for full conversation history
 const displayableMessages = React.useMemo(() => {
   const filteredMessages = conversation.filter(shouldDisplayMessage);

   // Show all messages for complete conversation history
   return filteredMessages;
 }, [conversation]);

 return (
   <div className="flex flex-col w-full h-full overflow-hidden bg-white">
     {/* Messages Container - ChatGPT style */}
     <div
       ref={scrollRef}
       className="flex-1 overflow-y-auto"
       style={{
         scrollbarWidth: 'thin',
         scrollbarColor: '#cbd5e0 transparent'
       }}
     >
       <AnimatePresence mode="popLayout">
         {displayableMessages.map((message) => (
           <ConversationItem key={message.id} message={message} />
         ))}
       </AnimatePresence>

       {/* Bottom padding for better UX */}
       <div className="h-4" />
     </div>
   </div>
 );
}
