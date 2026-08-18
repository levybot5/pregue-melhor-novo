"use client";

import { useState, useTransition } from "react";
import { CheckIcon } from "@/components/icons";
import { toggleLessonCompletionAction } from "@/app/academia/actions";

type LessonCompleteButtonProps = {
  courseId: string;
  moduleId: number;
  lessonId: number;
  initialCompleted: boolean;
};

export function LessonCompleteButton({
  courseId,
  moduleId,
  lessonId,
  initialCompleted,
}: LessonCompleteButtonProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const next = !completed;
    setError(null);
    startTransition(async () => {
      const result = await toggleLessonCompletionAction(courseId, moduleId, lessonId, next);
      setCompleted(result.completed);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`flex min-h-[52px] items-center justify-center gap-2 rounded-2xl px-5 font-semibold transition-colors disabled:opacity-60 ${
          completed
            ? "border border-card-border bg-card text-foreground"
            : "bg-primary text-primary-foreground"
        }`}
      >
        <CheckIcon className="h-5 w-5" />
        {completed ? "Aula concluída" : "Marcar como concluída"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
