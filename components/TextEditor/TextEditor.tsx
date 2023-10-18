import { ClientSideSuspense } from "@liveblocks/react";
import LiveblocksProvider from "@liveblocks/yjs";
import { CharacterCount } from "@tiptap/extension-character-count";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Highlight from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import Youtube from "@tiptap/extension-youtube";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { EditorView } from "prosemirror-view";
import { useEffect, useState } from "react";
import * as Y from "yjs";
import { useRoom, useSelf } from "../../liveblocks.config";
import { DocumentSpinner } from "../../primitives/Spinner";
import { CustomTaskItem } from "./CustomTaskItem";
import { SelectionMenu } from "./SelectionMenu";
import { Toolbar } from "./Toolbar";
import { WordCount } from "./WordCount";
import styles from "./TextEditor.module.css";
import TableCell from '@tiptap/extension-table-cell'
import Table from '@tiptap/extension-table'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import './Toolbar.module.css'
// import { ySyncPlugin, yCursorPlugin } from 'tiptap-yjs';
import { Editor } from "novel";


export function TextEditor() {
  return (
    <ClientSideSuspense fallback={<DocumentSpinner />}>
      {() => <NovelEditor />}
    </ClientSideSuspense>

  );
}

// Collaborative text editor with simple rich text and live cursors
export function NovelEditor() {
  const room = useRoom();
  const [doc, setDoc] = useState<Y.Doc>();
  const [provider, setProvider] = useState<any>();
  const [cont,setCont] =useState<any>("");


  // Set up Liveblocks Yjs provider
  useEffect(() => {
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksProvider(room, yDoc);
    setDoc(yDoc);
    setProvider(yProvider);
    // yProvider.once("sync", () =>setCont("Hey hii"));
    // Initialize the document with initial content

    return () => {
      yDoc?.destroy();
      yProvider?.destroy();
    };
  }, [room]);



  if (!doc || !provider) {
    return null;
  }

  return <TiptapEditor doc={doc} provider={provider} cont={cont} />;
}

type EditorProps = {
  doc: Y.Doc;
  provider: any;
  cont:any;
};

function TiptapEditor({ doc, provider,cont }: EditorProps) {
  // Get user info from Liveblocks authentication endpoint
  const { name, color, avatar: picture } = useSelf((me) => me.info);

  // Check if user has write access in current room
  const canWrite = useSelf((me) => me.canWrite);

  // });


  const novelExtensions = [
    // Register the document with Tiptap
    Collaboration.configure({
      document: doc,
    }),
    // Attach provider and user info
    CollaborationCursor.configure({
      provider: provider,
      user: {
        name,
        color,
        picture,
      },
    }),
  ]
  // To set default content on document creation for the first time
  // useEffect(() => {
  //   function setDefault() {
  //     if (!Editor) {
  //       return;
  //     }

  //     if (Editor.getText() === "") {
  //       Editor.commands.setContent(`
  //      <h1>Heeloo ......</h1>
  //       `);
  //     }
  //   }
  //   provider.on("sync", setDefault);

  //   return () => provider.off("sync", setDefault);
  // }, [provider, Editor]);




  //with novel editor
  return (
    <div className={styles.container}>
      { canWrite?<Editor extensions={novelExtensions} className="rounded-xl bg-gradient-to-r p-[3px] from-[#7928ca] to-[#ff0080] m-40 my-20 w-md " />:null}
    </div>
  );

}

// Prevents a matchesNode error on hot reloading
EditorView.prototype.updateState = function updateState(state) {
  // @ts-ignore
  if (!this.docView) return;
  // @ts-ignore
  this.updateStateInner(state, this.state.plugins != state.plugins);
};
