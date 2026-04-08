// your code here for S2 to display a single user profile after having clicked on it
// each user has their own slug /[id] (/1, /2, /3, ...) and is displayed using this file
// try to leverage the component library from antd by utilizing "Card" to display the individual user
// import { Card } from "antd"; // similar to /app/users/page.tsx

"use client";
// For components that need React hooks and browser APIs,
// SSR (server side rendering) has to be disabled.
// Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import React from "react";
import { Card, Button } from "antd";
import { useParams, useRouter } from "next/navigation";

const Profile: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const userId = params.id;

  return (
    <div className="card-container" style={{ padding: "20px"}}>
      <Card 
        title = "User Profile"
        extra = {
          <Button 
            type="primary" 
            onClick={() => router.push(`/users/${userId}/settings`)}
          >
            Edit Profile
          </Button>
        }
   >
        <p><strong>Username:</strong> SampleUser</p>
        {/* Hier kommen später die echten Daten hin */}
      </Card>
    </div>
  );
};

export default Profile;
