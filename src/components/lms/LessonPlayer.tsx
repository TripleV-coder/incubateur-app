"use client";

import React from 'react';
import { updateLessonProgress } from '@/app/actions/lms';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import Link from 'next/link';

type Lesson = {
  id: string;
  title: string;
  order: number;
  content: string | null;
  videoUrl: string | null;
  resourceUrl?: string | null;
  progress: Array<{ id: string }>;
};

interface LessonPlayerProps {
  lesson: Lesson;
  nextLessonId?: string;
  prevLessonId?: string;
  courseId?: string;
}

export const LessonPlayer = ({ lesson, nextLessonId, prevLessonId, courseId }: LessonPlayerProps) => {
  const isCompleted = lesson.progress?.length > 0;

  const handleToggleProgress = async () => {
    await updateLessonProgress(lesson.id, !isCompleted);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-elite-black/20">
      {/* Video Container */}
      <div className="aspect-video bg-black w-full relative group">
        {lesson.videoUrl ? (
          <iframe
            src={lesson.videoUrl}
            className="w-full h-full"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-snow/20 italic">
            Vidéo non disponible
          </div>
        )}
      </div>

      {/* Lesson Header & Progress */}
      <div className="p-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-gold text-xs font-bold uppercase tracking-widest mb-1 block">
              Leçon {lesson.order}
            </span>
            <h1 className="font-elite text-3xl md:text-4xl font-bold text-snow">
              {lesson.title}
            </h1>
          </div>
          
          <button
            onClick={handleToggleProgress}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
              isCompleted 
                ? 'bg-gold/10 text-gold border border-gold/30' 
                : 'bg-white/5 hover:bg-white/10 text-snow border border-white/10'
            }`}
          >
            {isCompleted && <Check className="w-4 h-4" />}
            {isCompleted ? 'Complété' : 'Marquer comme terminé'}
          </button>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none text-snow/70 leading-relaxed mb-20">
          {lesson.content || "Aucun contenu écrit pour cette leçon."}
        </div>

        {lesson.resourceUrl && (
          <div className="mb-10">
            <a
              href={lesson.resourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gold/10 hover:bg-gold text-gold hover:text-elite-black px-5 py-3 rounded-lg font-bold transition-all text-sm"
            >
              Télécharger la ressource PDF
            </a>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between border-t border-white/5 pt-8 mb-12">
          {prevLessonId && courseId ? (
            <Link 
              href={`/courses/${courseId}/lessons/${prevLessonId}`}
              className="flex items-center gap-2 text-snow/40 hover:text-gold transition-colors font-medium"
            >
              <ChevronLeft className="w-5 h-5" /> Précédent
            </Link>
          ) : <div />}

          {nextLessonId && courseId && (
            <Link 
              href={`/courses/${courseId}/lessons/${nextLessonId}`}
              className="flex items-center gap-2 bg-gold/5 hover:bg-gold/10 text-gold px-8 py-3 rounded-xl border border-gold/20 transition-all font-bold group"
            >
              Suivant <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPlayer;
