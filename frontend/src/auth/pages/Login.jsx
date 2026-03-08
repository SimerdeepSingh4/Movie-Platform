import { Link, useNavigate } from "react-router-dom";
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
import logo from "../../../public/favicon.svg"
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  
  useGSAP(() => {
    gsap.to(".move", {
      yPercent: -310,
      duration: 15,
      repeat: -1,
      ease: "none",
    });

    gsap.to(".move2", {
      yPercent: 200,
      repeat: -1,
      duration: 15,
      ease: "none",
    });
  })
  const posters = [
    "https://ik.imagekit.io/dhyh95euj/movie%20posters/PC1.jpg",
    "https://ik.imagekit.io/dhyh95euj/movie%20posters/PC19.jpg",
    "https://ik.imagekit.io/dhyh95euj/movie%20posters/PC9.jpg",
    "https://ik.imagekit.io/dhyh95euj/movie%20posters/PC18.jpg",
    "https://ik.imagekit.io/dhyh95euj/movie%20posters/PC4.jpg",
    "https://ik.imagekit.io/dhyh95euj/movie%20posters/PC11.jpg"
  ];
  const posters2 = [
    "https://ik.imagekit.io/dhyh95euj/movie%20posters/PC14.jpg",
    "https://ik.imagekit.io/dhyh95euj/movie%20posters/PC7.jpg",
    "https://ik.imagekit.io/dhyh95euj/movie%20posters/PC11.jpg",
    "https://ik.imagekit.io/dhyh95euj/movie%20posters/PC28.jpg",
    "https://ik.imagekit.io/dhyh95euj/movie%20posters/PC13.jpg",
    "https://ik.imagekit.io/dhyh95euj/movie%20posters/PC23.jpg"
  ];
  const posters3 = [
    "https://ik.imagekit.io/dhyh95euj/movie%20posters/PC18.jpg",
    "https://ik.imagekit.io/dhyh95euj/movie%20posters/PC3.jpg",
    "https://ik.imagekit.io/dhyh95euj/movie%20posters/PC11.jpg",
    "https://ik.imagekit.io/dhyh95euj/movie%20posters/PC22.jpg",
    "https://ik.imagekit.io/dhyh95euj/movie%20posters/PC1.jpg",
    "https://ik.imagekit.io/dhyh95euj/movie%20posters/PC17.jpg"
  ];
  
  const { handleLogin, user } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/');
    }
  }, [user, navigate]);

  const handleSubmit = (event) => {
    event.preventDefault()
    handleLogin(email, password)
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground flex overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-muted/30 z-0" />

      <div className="absolute left-0 top-0 w-[45%] lg:w-[50%] h-screen lg:flex hidden overflow-hidden gap-4 p-4 z-10 opacity-70">
        <div className="move flex flex-col gap-4 w-1/3">
          {[...posters, ...posters].map((src, i) => (
            <div key={i} className="marque shrink-0 rounded-xl overflow-hidden shadow-2xl aspect-[2/3]">
              <img className="w-full h-full object-cover" src={src} />
            </div>
          ))}
        </div>
        <div className="move2 flex flex-col gap-4 w-1/3 mt-[-50%] -translate-y-[280%]">

          {[...posters2, ...posters2].map((src, i) => (
            <div key={i} className="marque2 shrink-0 rounded-xl overflow-hidden shadow-2xl aspect-[2/3] ">
              <img className="w-full h-full object-cover" src={src} />
            </div>
          ))}

        </div>
        <div className="move flex flex-col gap-4 w-1/3">
          {[...posters3, ...posters3].map((src, i) => (
    <div key={i} className="marque shrink-0 rounded-xl overflow-hidden shadow-2xl aspect-[2/3]">
      <img className="w-full h-full object-cover" src={src} />
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
            <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    Forgot password?
                  </Link>
                </div>
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
            <Button form="login-form" type="submit" className="w-full h-11 font-semibold text-md shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
              Sign In
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
