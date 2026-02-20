import Image from "next/image";

interface LogoProps {
    className?: string;
}

export default function Logo({ className = "w-10 h-10" }: LogoProps) {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <Image
                src="/logo.png"
                alt="FitPlay Logo"
                fill
                className="rounded-lg object-contain"
                priority
            />
        </div>
    );
}