// Lista unificada do Bloco de Anotações: mistura anotações livres
// (personal_notes) com anotações de versículo feitas na Bíblia Guiada
// (bible_notes) — aparecem juntas aqui, mas cada uma continua editada
// no lugar de sempre (ver NotesListClient.tsx). "kind" decide pra onde
// o clique leva e o que o botão de excluir faz (só "personal" exclui
// direto daqui — versículo se edita/exclui no leitor).
export type UnifiedNoteItem =
  | {
      kind: "personal";
      id: string;
      title: string;
      content: string;
      updatedAt: string;
    }
  | {
      kind: "verse";
      verseId: string;
      reference: string;
      href: string;
      note: string;
      updatedAt: string;
    };
