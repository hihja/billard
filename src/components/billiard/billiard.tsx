import React, { useRef, useEffect, useState } from 'react';
import { Link } from "react-router-dom";

type Ball = {
    id: number;
    x: number;
    y: number;
    radius: number;
    velocityX: number;
    velocityY: number;
    color: string;
};

const BallPool: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [balls, setBalls] = useState<Ball[]>([]);
    const [selectedBall, setSelectedBall] = useState<Ball | null>(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const drawBall = (ball: Ball) => {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = ball.color;
            ctx.fill();
            ctx.closePath();
        };

        const update = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            balls.forEach(ball => {
                // Затухание скорости
                ball.velocityX *= 0.99; // Уменьшаем коэффициент затухания
                ball.velocityY *= 0.99; // Уменьшаем коэффициент затухания

                // Обновляем координаты шарика
                ball.x += ball.velocityX;
                ball.y += ball.velocityY;

                // Обработка столкновений со стенами холста
                if (ball.x + ball.radius >= canvas.width || ball.x - ball.radius <= 0) {
                    ball.velocityX *= -1;
                }
                if (ball.y + ball.radius >= canvas.height || ball.y - ball.radius <= 0) {
                    ball.velocityY *= -1;
                }

                // Обработка столкновений между шарами
                balls.forEach(otherBall => {
                    if (ball !== otherBall) {
                        const dx = otherBall.x - ball.x;
                        const dy = otherBall.y - ball.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < ball.radius + otherBall.radius) {
                            const angle = Math.atan2(dy, dx);
                            const targetX = ball.x + Math.cos(angle) * (ball.radius + otherBall.radius);
                            const targetY = ball.y + Math.sin(angle) * (ball.radius + otherBall.radius);

                            const ax = (targetX - otherBall.x) * 0.01;
                            const ay = (targetY - otherBall.y) * 0.01;

                            ball.velocityX -= ax;
                            ball.velocityY -= ay;
                            otherBall.velocityX += ax;
                            otherBall.velocityY += ay;
                        }
                    }
                });

                drawBall(ball);
            });

            requestAnimationFrame(update);
        };

        update();
    }, [balls]);

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Проверяем, был ли клик на каком-либо шарике
        for (const ball of balls) {
            const dx = mouseX - ball.x;
            const dy = mouseY - ball.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= ball.radius) {
                // Клик был на шарике
                setSelectedBall(ball);
                setMenuPosition({ x: event.clientX, y: event.clientY });
                setMenuVisible(true);
                return;
            }
        }

        // Если клик не был на шарике, создаем новый шарик
        const newBall: Ball = {
            id: balls.length + 1,
            x: mouseX,
            y: mouseY,
            radius: Math.random() * 20 + 10,
            velocityX: (Math.random() - 0.5) * 10,
            velocityY: (Math.random() - 0.5) * 10,
            color: `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`,
        };

        setBalls(prevBalls => [...prevBalls, newBall]);
    };

    const handleColorChange = (color: string) => {
        if (selectedBall) {
            // Обновляем цвет выбранного шарика
            const updatedBalls = balls.map(ball =>
                ball.id === selectedBall.id ? { ...ball, color } : ball
            );
            setBalls(updatedBalls);
        }
        setMenuVisible(false);
    };

    const renderColorMenu = () => {

        const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'brown', 'pink'];

        return (
            <div style={{
                    position: 'absolute',
                    top: menuPosition.y,
                    left: menuPosition.x,
                    backgroundColor: 'white',
                    border: '1px solid black',
                    padding: '5px',
                    zIndex: 999,
                }}>

                {colors.map(color => (
                    <div
                        key={color}
                        onClick={() => handleColorChange(color)}
                        style={{ backgroundColor: color, width: '20px', height: '20px', borderRadius: '50%', display: 'inline-block', marginRight: '5px' }}
                    ></div>
                ))}
            </div>
        );
    };

    return (
        <>
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                style={{ border: '1px solid black' }}
                onMouseDown={handleMouseDown}
            ></canvas>
            {menuVisible && renderColorMenu()}

            <h2>click mouse1 to create a ball</h2>
            <div style={{display: "flex", flexDirection: "column"}}>
                <Link to="https://spb.hh.ru/resume/eeaab888ff0cf075060039ed1f314a63584c59" target="_blank">Резюме</Link>
                <Link to="https://t.me/hihja_dev" target="_blank">Telegram hihja_dev</Link>
            </div>


        </>
    );
};

export default BallPool;

