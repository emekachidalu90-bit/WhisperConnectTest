import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

type ChatMessage = {
  id: string;
  type: "public" | "whisper" | "system";
  text: string;
  from?: string;
  to?: string;
  own?: boolean;
};

const WHISPER_REGEX = /^\/w\s+(\S+)\s+(.+)$/i;

export default function ChatPage() {
  const [socket, setSocket] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      type: "system",
      text: "Welcome! Use /w username message to send a private whisper.",
    },
  ]);

  const endRef = useRef<HTMLDivElement>(null);
  const usernameRef = useRef("");

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  useEffect(() => {
    const nextSocket = (window as any).io();

    nextSocket.on("connect_error", () => {
      setLoginError("Unable to connect to chat server.");
    });

    nextSocket.on("login-success", ({ username: loggedInUsername }: { username: string }) => {
      setActiveUser(loggedInUsername);
      setLoginError("");
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "system",
          text: `Logged in as ${loggedInUsername}.`,
        },
      ]);
    });

    nextSocket.on("login-error", ({ message }: { message: string }) => {
      setLoginError(message);
    });

    nextSocket.on("user-list", (users: string[]) => {
      setOnlineUsers(users);
    });

    nextSocket.on("user-joined", ({ username: joinedUsername }: { username: string }) => {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), type: "system", text: `${joinedUsername} joined the chat.` },
      ]);
    });

    nextSocket.on("user-left", ({ username: leftUsername }: { username: string }) => {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), type: "system", text: `${leftUsername} left the chat.` },
      ]);
    });

    nextSocket.on("public-message", ({ username: from, message }: { username: string; message: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "public",
          from,
          text: message,
          own: usernameRef.current.toLowerCase() === from.toLowerCase(),
        },
      ]);
    });

    nextSocket.on("whisper", ({ from, to, message }: { from: string; to: string; message: string }) => {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), type: "whisper", from, to, text: message },
      ]);
    });

    nextSocket.on("whisper-sent", ({ to, message }: { to: string; message: string }) => {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), type: "whisper", from: usernameRef.current || "You", to, text: message, own: true },
      ]);
    });

    nextSocket.on("whisper-error", ({ message }: { message: string }) => {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), type: "system", text: message }]);
    });

    setSocket(nextSocket);
    return () => {
      nextSocket.emit("logout");
      nextSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sortedUsers = useMemo(() => [...onlineUsers].sort((a, b) => a.localeCompare(b)), [onlineUsers]);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!socket) return;
    setLoginError("");
    socket.emit("login", { username, password });
  };

  const handleSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = messageInput.trim();
    if (!socket || !text || !activeUser) return;

    const whisperMatch = text.match(WHISPER_REGEX);
    if (whisperMatch) {
      socket.emit("whisper", { to: whisperMatch[1], message: whisperMatch[2] });
    } else {
      socket.emit("public-message", { message: text });
    }

    setMessageInput("");
  };

  const handleLogout = () => {
    if (!socket) return;
    socket.emit("logout");
    setActiveUser(null);
    setOnlineUsers([]);
    setPassword("");
    setMessages([{ id: crypto.randomUUID(), type: "system", text: "You were logged out." }]);
  };

  if (!activeUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <Card className="w-full max-w-md p-6 space-y-4">
          <div>
            <h1 className="text-2xl font-semibold">WhisperConnect Chat</h1>
            <p className="text-sm text-muted-foreground">Sign in to join the live chat room.</p>
          </div>

          <form className="space-y-3" onSubmit={handleLogin}>
            <Input
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              minLength={2}
              maxLength={20}
              required
            />
            <Input
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
            />
            {loginError && <p className="text-sm text-destructive">{loginError}</p>}
            <Button type="submit" className="w-full">Join Chat</Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto grid h-[calc(100vh-2rem)] max-w-6xl grid-cols-1 gap-4 md:grid-cols-[250px_1fr]">
        <Card className="p-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">Online Users</h2>
            <span className="text-sm text-muted-foreground">{onlineUsers.length}</span>
          </div>
          <ScrollArea className="h-[calc(100%-2rem)] pr-2">
            <ul className="space-y-1 text-sm">
              {sortedUsers.map((user) => (
                <li key={user} className={user === activeUser ? "font-semibold text-primary" : "text-muted-foreground"}>
                  {user}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </Card>

        <Card className="flex flex-col p-3">
          <div className="mb-3 flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="font-semibold">Room Chat</h2>
              <p className="text-xs text-muted-foreground">Logged in as {activeUser}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>

          <ScrollArea className="mb-3 flex-1 rounded-md border p-3">
            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id} className="text-sm">
                  {message.type === "system" ? (
                    <p className="text-muted-foreground">• {message.text}</p>
                  ) : (
                    <p>
                      <span className={message.type === "whisper" ? "text-purple-500" : "text-primary"}>
                        {message.type === "whisper" ? "[Whisper] " : ""}
                        {message.from}
                      </span>
                      {message.to ? ` → ${message.to}` : ""}: {message.text}
                    </p>
                  )}
                </div>
              ))}
              <div ref={endRef} />
            </div>
          </ScrollArea>

          <form className="flex gap-2" onSubmit={handleSend}>
            <Input
              placeholder="Type a message or /w username message"
              value={messageInput}
              onChange={(event) => setMessageInput(event.target.value)}
              maxLength={1000}
            />
            <Button type="submit">Send</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
