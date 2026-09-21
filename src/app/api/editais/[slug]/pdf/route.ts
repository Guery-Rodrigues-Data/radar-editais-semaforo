import fs from "node:fs";
import path from "node:path";
import { getEdital } from "@/lib/data";

// Os PDFs originais dos editais ficam FORA do repo, na máquina do Guery
// (`C:\Users\guery.braga\Documents\Editais\`), e alguns dentro do vault em
// `Editais/PDF/`. Esta rota lê o arquivo do disco e devolve pro navegador.
// Só funciona rodando o site localmente — no deploy (Vercel) a pasta não
// existe e a rota responde 404 com uma explicação.

const EXTERNAL_DIR =
  process.env.EDITAIS_PDF_DIR ?? "C:\\Users\\guery.braga\\Documents\\Editais";
// process.cwd() no runtime = pasta `site/`; o vault é o pai.
const VAULT_PDF_DIR = path.resolve(process.cwd(), "..", "Editais", "PDF");

function contentType(name: string): string {
  const ext = name.toLowerCase().split(".").pop();
  if (ext === "pdf") return "application/pdf";
  if (ext === "doc") return "application/msword";
  if (ext === "docx")
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "application/octet-stream";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const edital = getEdital(slug);

  if (!edital) {
    return new Response("Edital não encontrado.", { status: 404 });
  }
  if (!edital.pdfName) {
    return new Response("Este edital ainda não tem PDF original mapeado.", {
      status: 404,
    });
  }

  const dir = edital.pdfInVault ? VAULT_PDF_DIR : EXTERNAL_DIR;
  const filePath = path.join(dir, edital.pdfName);

  // Trava contra path traversal via nome de arquivo malicioso.
  if (!path.resolve(filePath).startsWith(path.resolve(dir) + path.sep)) {
    return new Response("Caminho inválido.", { status: 400 });
  }
  if (!fs.existsSync(filePath)) {
    return new Response(
      "PDF indisponível neste ambiente. Os editais em PDF ficam só na máquina do Guery — " +
        "rode o site localmente pra baixá-los.",
      { status: 404 }
    );
  }

  const file = fs.readFileSync(filePath);
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": contentType(edital.pdfName),
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(
        edital.pdfName
      )}`,
      "Content-Length": String(file.byteLength),
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
