"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import imageCompression from "browser-image-compression";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";

// ==========================================
// CONFIGURATION SUPABASE
// ==========================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://VOTRE_PROJET.supabase.co";
// Note : Pour l'upload, assurez-vous que l'utilisateur a les droits (RLS) sur le bucket de stockage
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "VOTRE_CLE_ANON";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminMediaPage() {
  // États
  const [reference, setReference] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  // UI States
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // GESTION DU DRAG & DROP
  // ==========================================
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      setStatus({ type: 'error', message: "Veuillez sélectionner un fichier image valide (JPG, PNG...)." });
      return;
    }
    setFile(selectedFile);
    // Création d'une URL locale pour l'aperçu visuel de l'image
    setPreview(URL.createObjectURL(selectedFile));
    setStatus({ type: 'idle', message: '' });
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // ==========================================
  // COMPRESSION ET UPLOAD
  // ==========================================
  const handleUpload = async () => {
    if (!reference.trim()) {
      setStatus({ type: 'error', message: "La référence de l'article (Code) est obligatoire." });
      return;
    }

    if (!file) {
      setStatus({ type: 'error', message: "Veuillez sélectionner une image." });
      return;
    }

    setIsUploading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      // 1. Compression via browser-image-compression
      const options = {
        maxSizeMB: 0.5, // Compression ciblée à ~500 Ko max
        maxWidthOrHeight: 1200, // Redimensionnement intelligent pour le e-commerce
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);
      
      // 2. Formatage du nom de fichier exact: [reference].jpg
      const cleanRef = reference.trim().toUpperCase();
      const fileName = `${cleanRef}.jpg`;

      // 3. Upload vers le bucket Supabase "produits-images"
      const { error } = await supabase.storage
        .from('produits-images')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: true, // FORCER L'ÉCRASEMENT si l'image existe déjà
          contentType: 'image/jpeg' // On force le MIME type en JPEG
        });

      if (error) {
        throw error;
      }

      // 4. Succès de l'opération
      setStatus({ type: 'success', message: `Super ! L'image du produit ${cleanRef} a été envoyée avec succès.` });
      
      // Remise à zéro du formulaire pour faciliter le prochain ajout
      setFile(null);
      setPreview(null);
      setReference("");
      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (error: any) {
      console.error("Upload error:", error);
      setStatus({ type: 'error', message: error.message || "Erreur de connexion au serveur de stockage." });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Médias & Photos</h1>
        <p className="text-slate-500 mt-2">Ajoutez ou mettez à jour les photos de vos articles A2Soft. Elles seront compressées automatiquement.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-black/5">
        
        {/* Champ Référence */}
        <div className="mb-8">
          <label htmlFor="reference" className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
            Référence Article (Code) *
          </label>
          <input
            id="reference"
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Ex: 50401-22"
            disabled={isUploading}
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 uppercase focus:border-black focus:ring-0 transition-colors disabled:opacity-50"
          />
        </div>

        {/* Zone Drag & Drop */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
            Image du Produit *
          </label>
          
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-black hover:bg-slate-50'}
              ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
              ${preview ? 'p-2' : ''}
            `}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept="image/*" 
              className="hidden" 
              disabled={isUploading}
            />

            {preview ? (
              // Aperçu de l'image sélectionnée
              <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-xl border border-black/10">
                <Image 
                  src={preview} 
                  alt="Aperçu" 
                  fill 
                  className="object-contain bg-white"
                />
                
                {/* Bouton pour retirer l'image */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  disabled={isUploading}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
            ) : (
              // État Vide
              <div className="py-12 flex flex-col items-center">
                <div className="bg-white p-4 rounded-full shadow-sm border border-black/5 mb-4 text-slate-400 group-hover:text-black transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                </div>
                <p className="text-lg font-semibold text-slate-700">Glissez-déposez une image ici</p>
                <p className="text-sm text-slate-500 mt-1">ou cliquez pour parcourir vos fichiers (Max 5MB)</p>
              </div>
            )}
          </div>
        </div>

        {/* Indicateurs de Statut (Succès / Erreur) */}
        {status.message && (
          <div className={`p-4 rounded-xl mb-6 flex items-start space-x-3 ${
            status.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'
          }`}>
            {status.type === 'error' ? (
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
            <p className="font-medium text-sm">{status.message}</p>
          </div>
        )}

        {/* Bouton d'Upload */}
        <button
          onClick={handleUpload}
          disabled={isUploading || !file || !reference.trim()}
          className="w-full h-14 bg-black text-white font-bold rounded-xl flex items-center justify-center space-x-2 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              {/* Spinner */}
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Compression et envoi en cours...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              <span>Uploader la photo</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
}
