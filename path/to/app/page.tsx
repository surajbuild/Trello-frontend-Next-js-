import { ChatBox } from "@/components/ChatBox";
import { useState } from "react";

export default function Home() {
  const [greeting, setGreeting] = useState("Hey");

  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <div>
        <button onClick={() => setGreeting("Hey")}>Change Greeting</button>
        <ChatBox greeting={greeting} />
      </div>
    </div>
  );
}
