MISANTROPIA — LANDING PAGE JAC 2026

Arquivos:
- index.html: estrutura e textos
- style.css: identidade visual e responsividade
- script.js: menu mobile e easter eggs
- assets/logo-misantropia.png: logo fornecida

COMO ABRIR
1. Extraia a pasta do ZIP.
2. Abra index.html no navegador. Não precisa instalar nada nem usar servidor.

COMO COLOCAR AS FOTOS DO ELENCO
1. Coloque as fotos dentro de assets/ (ex.: nadine.jpg).
2. Em index.html, localize cada bloco <div class="photo-slot"> dentro de .cast-member.
3. Troque o conteúdo do bloco por, por exemplo:
   <div class="photo-slot"><img src="assets/nadine.jpg" alt="Nome da atriz"></div>
4. No style.css, adicione:
   .photo-slot img { width:100%; height:100%; object-fit:cover; display:block; }
5. Troque “Nome do ator / atriz” e “PERSONAGEM” pelos dados reais.

EASTER EGGS INCLUÍDOS
- Clique cinco vezes na logo vermelha para revelar uma mensagem.
- Clique no pequeno símbolo † quase invisível no lado direito do título.
- Digite NADINE no teclado enquanto estiver na página.
- Clique três vezes em “DENTRO.” no manifesto.
- O botão ? no rodapé também abre um arquivo secreto.

As datas e informações de apresentação não foram inventadas; se houver data, horário, local específico ou link de ingressos, você pode acrescentar no HTML.
