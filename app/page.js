'use client'
import { Avatar, Button, Input, Skeleton, Stack } from "@chakra-ui/react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const API_KEY = 'AIzaSyAMHA4SLgq6Gtbhfr4YOyS1qYXV7rvEcYo';
  const inputRef = useRef(null);
  const [data, setData] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const handleSendQuestion = async () => {
    if (!inputText) {
      return;
    }
  
    setLoading(true);
  
    const newData = [...data, {
        role: "user",
        parts: inputText,
    }];

    setData(newData);
  
    await fetchDataFromGeminiProAPI(newData);
    setInputText("");
    setLoading(false);
  };
  
  const fetchDataFromGeminiProAPI = async (newData) => {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
    const chat = model.startChat({
      history: data
    });

    try {
      const result = await chat.sendMessage(inputText);
      const response = await result.response;
      const text = response.text();
    
      newData = [...newData, {
        role: "model",
        parts: text,
      }];
  
      setData(newData);
    } catch (error) {
      alert('server error')
    }
   
  };

  const formatBoldText = (text) => {
    const parts = text.split('**');
    return parts.map((part, index) =>
      index % 2 === 0 ? (
        <span key={index}>{part}</span>
      ) : (
        <strong key={index}>{part}</strong>
      )
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      handleSendQuestion();
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="min-h-[calc(100vh-105px)] md:min-h-[calc(100vh-120px)]">
        {data?.map((item, index) => (
          <div 
            key={`chat-${index}`}
          >
            {item?.role === 'user' ? (
              <div className="mb-4">
                <div className="flex justify-end">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-gray-600">Hoàng Nam</div>
                    <Avatar name='Bot' src='https://toigingiuvedep.vn/wp-content/uploads/2022/01/anh-meo-cute.jpg' />
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-blue-400 max-w-[70%] text-white p-2 md:p-3 rounded-lg mt-1 whitespace-pre-wrap">
                    {item?.parts}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <Avatar name='Bot' src='https://png.pngtree.com/png-vector/20240125/ourlarge/pngtree-little-cute-robot-funny-virtual-assistant-bot-png-image_11549965.png' />
                  <div className="font-semibold text-gray-600">Bot đần</div>
                </div>
                <div className="whitespace-pre-wrap bg-blue-400 max-w-[70%] text-white p-2 md:p-3 rounded-lg mt-1">
                  {formatBoldText(item?.parts)}
                </div>
              </div>
            )
          }  
          </div>
        ))}

        {loading && (
          <div>
            <div className="flex items-center gap-2">
              <Avatar name='Bot' src='https://png.pngtree.com/png-vector/20240125/ourlarge/pngtree-little-cute-robot-funny-virtual-assistant-bot-png-image_11549965.png' />
              <div className="font-semibold text-gray-600">Bot đần</div>
            </div>
        
            <Stack className="mt-1 max-w-[70%]">
              <Skeleton height='20px' />
              <Skeleton height='20px' />
              <Skeleton height='20px' />
            </Stack>
          </div>
        )}
       
      </div>

      <div className="flex gap-2 md:gap-4 mt-6">
        <Input 
          ref={inputRef}
          placeholder='Nhập câu hỏi'
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}  
          onKeyDown={handleKeyDown}
        />

        <Button
          isLoading={loading}
          onClick={() => handleSendQuestion()}
          colorScheme='twitter'
          paddingX={5}
        >
            Gửi
        </Button>
      </div>
    </div>
  );
}
