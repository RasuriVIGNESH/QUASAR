import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-lg"
            >
                <div className="mb-6 relative h-48 flex items-center justify-center">
                    <motion.div
                        animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                    >
                        <div className="text-9xl font-black text-slate-200 dark:text-slate-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10">
                            404
                        </div>
                        <Search className="h-32 w-32 text-indigo-500 opacity-80" />
                    </motion.div>
                </div>

                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
                    Page not found
                </h1>

                <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
                    Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
                </p>

                <Button
                    onClick={() => navigate(-1)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none h-12 px-8 rounded-xl font-semibold text-base"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Go Back
                </Button>
            </motion.div>
        </div>
    );
}
