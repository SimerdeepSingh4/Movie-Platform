import React from 'react'
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Label } from "@/components/ui/label";
import logo from "../../assets/favicon/favicon.svg"
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const { handleRegister } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    handleRegister(username, email, password);
  };

  useGSAP(() => {
    gsap.to(".marque", {
      yPercent: -100,
      duration: 3,
      repeat: -1,
      ease: "none",
    });


    gsap.to(".marque2", {
      repeat: -1,
      yPercent: 100,
      duration: 3,
      ease: "none",
    });
  })
  return (
    <div className="relative min-h-screen bg-background text-foreground flex overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-muted/30 z-0" /> 
      <div className="absolute left-0 top-0 w-[45%] lg:w-[50%] h-screen lg:flex hidden overflow-hidden gap-4 p-4 z-10 opacity-70">
        <div className="move flex flex-col gap-4 w-1/3">
          {[...Array(6)].map((_, i) => (
            <div key={`m1-${i}`} className="marque shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-2xl">
              <img className="w-full h-auto object-cover" src="https://images.unsplash.com/photo-1772678595035-4ff18bac6d93?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
            </div>
          ))}
        </div>
        <div className="move2 flex flex-col gap-4 w-1/3 mt-[-50%]">
          {[...Array(6)].map((_, i) => (
            <div key={`m2-${i}`} className="marque2 shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-2xl -translate-y-full">
              <img className="w-full h-auto object-cover" src="https://images.unsplash.com/photo-1772678595035-4ff18bac6d93?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
            </div>
          ))}
        </div>
        <div className="move flex flex-col gap-4 w-1/3">
          {[...Array(6)].map((_, i) => (
            <div key={`m3-${i}`} className="marque shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-2xl">
              <img className="w-full h-auto object-cover" src="https://images.unsplash.com/photo-1772678595035-4ff18bac6d93?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
            </div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-1/2 lg:ml-auto relative z-20 flex flex-col items-center justify-center p-8 bg-background/50 backdrop-blur-xl border-l border-border/50 shadow-2xl">
        <div className="w-full max-w-md flex flex-col items-center ">
          <Link to="/" className="flex items-center hover:scale-105 transition-transform duration-300">
            <img className="w-44 h-44  object-contain filter drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" src={logo} alt="CineBase Logo" />
            <h1 className="-ml-10 text-4xl font-extrabold tracking-wider uppercase text-primary drop-shadow-md font-[japan]">CineBase</h1>
          </Link>
        </div>

        <Card className="w-full max-w-md bg-card/80 backdrop-blur-md border-border/50 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
            <CardDescription className="text-center">
              Sign up with your email to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="register-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  onChange={(e) => setUsername(e.target.value)}
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  required
                  className="bg-background/50 focus:bg-background transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  onChange={(e) => setEmail(e.target.value)}
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="bg-background/50 focus:bg-background transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  onChange={(e) => setPassword(e.target.value)} 
                  id="password" 
                  type="password" 
                  required 
                  placeholder="••••••••" 
                  className="bg-background/50 focus:bg-background transition-colors"
                />
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button form="register-form" type="submit" className="w-full h-11 font-semibold text-md shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
              Create Account
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline underline-offset-4">
                Log In
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default Register
