'use client'
import { Avatar, Box, Button, Input, Skeleton, Stack } from "@chakra-ui/react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const API_KEY = 'AIzaSyAMHA4SLgq6Gtbhfr4YOyS1qYXV7rvEcYo';
  const inputRef = useRef(null);
  const [data, setData] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  useEffect(() => {
    const chatBox = document.getElementById("chat-box");
    chatBox.scrollTop = chatBox.scrollHeight;
  }, [data]);

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
  
    } catch (error) {
      newData = [...newData, {
        role: "model",
        parts: 'Opps! Server error, please try again later.',
      }];
    }

    setData(newData);
  };

  const formatBoldText = (text) => {
    const parts = text.split('**' | '```');
    return parts.map((part, index) =>
      index % 2 === 0 ? (
        <span key={index}>{part}</span>
      ) : (
        <strong key={index}>{part}</strong>
      )
    );
  };

  const formatBoldAndCodeText = (text) => {
    const parts = text.split(/(\*\*|```)/);
    let inCodeBlock = false;
    let strongText = false

    return parts.map((part, index) => {
      if (part === '**') {
        strongText = !strongText

        if(strongText) {
          return <span key={index}>{part}</span>
        } else {
          return <strong key={index}>{part}</strong>
        }
      } else if (part === '```') {
        inCodeBlock = !inCodeBlock;
        return inCodeBlock ? <code key={index} /> : '';
      } else {
        return inCodeBlock ? <pre style={{ background: 'black'}}><code key={index}>{part}</code></pre> : part;
      }
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      handleSendQuestion();
    }
  };

  const renderers = {
    code: ({ language, value }) => (
      <pre style={{ backgroundColor: '#f3f3f3', padding: '10px', borderRadius: '4px' }}>
        <code style={{ color: '#333' }}>{value}</code>
      </pre>
    ),
  };
  
  return (
    <div>
      <div className="fixed top-0 w-full z-10 bg-white py-3 md:py-4 text-xl md:text-3xl font-bold ">
        <div className="text-transparent bg-clip-text bg-gradient-to-br from-[#4a84f1] to-[#d36677] px-4 md:px-6">
          Blossom AI
        </div>
      </div>
      <Box 
        id="chat-box"
        className="h-[calc(100vh-95px)] md:-h-[calc(100vh-125px)] overflow-auto p-4 md:p-6 text-[15px] md:text-base transition-all duration-300 ease-in-out"
        sx={{
          '&::-webkit-scrollbar': {
            width: '5px',
            backgroundColor: 'white',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#e9ecf5',
            borderRadius: '5px',
          },
        }}
      >
        <div className="h-10 md:h-12"></div>
        {data.length ? data?.map((item, index) => (
          <div 
            key={`chat-${index}`}
          >
            {item?.role === 'user' ? (
              <div className="mb-4">
                <div className="flex justify-end">
                  <div className="bg-[#8c7fec] max-w-[70%] text-white p-2 md:p-3 rounded-xl mt-1 whitespace-pre-wrap">
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
                <div className="whitespace-pre-wrap bg-[#e9ecf5] max-w-[70%] text-gray-900 p-2 md:p-3 rounded-xl mt-1">
                  <ReactMarkdown>{item?.parts}</ReactMarkdown>
                </div>
              </div>
            )
          }  
          </div>
        )) : (
          <div className="text-xl md:text-4xl md:mt-4 font-semibold text-transparent bg-clip-text bg-gradient-to-br from-[#4a84f1] to-[#d36677]">
            Hello! How can I help you today?
          </div>
        )}

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
       
      </Box>

      <div className="flex gap-2 md:gap-4 bottom-5 md:bottom-6 fixed w-full px-4 md:px-6 bg-white">
        <Input 
          position={'relative'}
          focusBorderColor='#2ea7fc'
          rounded={'999px'}
          paddingRight={{ base:12, md:14 }}
          size={{ base:'md', md:'lg'}}
          ref={inputRef}
          placeholder='Nhập câu hỏi'
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}  
          onKeyDown={handleKeyDown}
          isDisabled={loading}
        />

        <Button
          position={'absolute'}
          zIndex={10}
          right={{base:2 ,md:5}}
          variant='ghost'
          isLoading={loading}
          onClick={() => handleSendQuestion()}
          colorScheme='twitter'
          paddingX={5}
          top={{base:0 ,md:1}}
          _hover={{
            bg: 'none'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 md:w-8 md:h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
