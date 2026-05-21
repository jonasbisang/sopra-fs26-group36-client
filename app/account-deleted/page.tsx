"use client";
import React from "react";
import Image from "next/image";
import { Button } from "antd";
import { useRouter } from "next/navigation";

const AccountDeletedPage: React.FC = () => {
  const router = useRouter();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#000000'
    }}>
      
      <Image 
        src="/FriendlerFriendsPicFinal.png" 
        alt="Farewell Presentation" 
        width={800} 
        height={450} 
        style={{ borderRadius: "10px", marginBottom: "30px", maxWidth: "90%", height: "auto" }}
      />

      <Button 
        type="primary" 
        size="large"
        style={{ backgroundColor: 'white', color: 'black', border: 'none', fontWeight: 'bold' }}
        onClick={() => router.push("/groups")}
      >
        Back to Groups
      </Button>
      
    </div>
  );
};

export default AccountDeletedPage;