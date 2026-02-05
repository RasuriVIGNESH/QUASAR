import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home, RefreshCw } from 'lucide-react';

export default function ServerError() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center"
            >
                <div className="mb-8 relative h-40 flex items-center justify-center">
                    {/* Animated 500 Graphic */}
                    <div className="relative">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="text-9xl font-black text-slate-100 dark:text-slate-800 select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        >
                            ⚙️
                        </motion.div>
                        <motion.div
                            initial={{ y: -20 }}
                            animate={{ y: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="relative z-10"
                        >
                            <h1 className="text-8xl font-black text-indigo-600 dark:text-indigo-500 tracking-tighter">
                                500
                            </h1>
                        </motion.div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    Internal Server Error
                </h2>

                <p className="text-slate-600 dark:text-slate-400 mb-8">
                    Oops! Something went wrong on our end. We're working to fix it. Please try again later.
                </p>

                <div className="flex gap-4 justify-center">
                    <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Retry
                    </Button>
                    <Button
                        onClick={() => navigate('/')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                    >
                        <Home className="h-4 w-4" />
                        Go Home
                    </Button>
                </div>
            </motion.div>

            {/* Background decoration */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute top-20 left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        y: [0, 20, 0],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{ duration: 7, repeat: Infinity, delay: 1 }}
                    className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
                />
            </div>
        </div>
    );
}
