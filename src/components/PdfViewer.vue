<template>
    <div class="pdf-viewer">
        <!-- 上传文件 -->
        <div class="file-upload">
            <input type="file" @change="onFileChange" accept=".pdf" />
        </div>

        <!-- 控制栏 -->
        <div class="controls">
            <button @click="prevPage" :disabled="currentPage <= 1">
                上一页
            </button>
            <button @click="nextPage" :disabled="currentPage >= totalPages">
                下一页
            </button>
            <input
                type="number"
                v-model.number="currentPageInput"
                @keyup.enter="goToPage"
                :max="totalPages"
                min="1"
            />
            / {{ totalPages }}
            <button @click="zoomIn">放大</button>
            <button @click="zoomOut">缩小</button>
            <button @click="downloadPdf" :disabled="!pdfBlob">下载</button>
            <button @click="printPdf" :disabled="!pdfBlob">打印</button>
        </div>

        <!-- 渲染 PDF 的画布 -->
        <div class="canvas-container">
            <canvas ref="pdfCanvas"></canvas>
        </div>

        <!-- 隐藏的 iframe 用于打印 -->
        <iframe ref="printIframe" style="display: none;"></iframe>
    </div>
</template>


<script>
import { ref, reactive, onMounted } from 'vue';
import * as pdfjsLib from 'pdfjs-dist';
import * as PdfWorker from 'pdfjs-dist/build/pdf.worker.js';
import { saveAs } from 'file-saver';

export default {
  name: 'PdfViewer',
    setup() {
        const pdfCanvas = ref(null);
        const printIframe = ref(null);
        const pdfBlob = ref(null);
        let pdfDoc = null;
        const currentPage = ref(1);
        const currentPageInput = ref(1);
        const totalPages = ref(0);
        const scale = ref(1.0);

        const loadPdf = async (file) => {
            const fileReader = new FileReader();
            fileReader.onload = async (e) => {
                const pdfData = e.target.result;
                pdfjsLib.GlobalWorkerOptions.workerSrc =
                    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

                pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;

                totalPages.value = pdfDoc.numPages;
                currentPage.value = 1;
                currentPageInput.value = 1;
                pdfBlob.value = new Blob([pdfData], { type: 'application/pdf' });
                renderPage();
            };
            fileReader.readAsArrayBuffer(file);
        };

        const renderPage = async () => {
            if (!pdfDoc) return;

            const page = await pdfDoc.getPage(currentPage.value);
            const viewport = page.getViewport({ scale: scale.value });
            const canvas = pdfCanvas.value;
            const context = canvas.getContext('2d');

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            const renderContext = {
                canvasContext: context,
                viewport,
            };
            page.render(renderContext);
        };

        const downloadPdf = () => {
            if (!pdfBlob.value) return;

            const link = document.createElement('a');
            link.href = URL.createObjectURL(pdfBlob.value);
            link.download = 'downloaded.pdf';
            link.click();
        };

        const printPdf = () => {
            if (!pdfBlob.value) return;

            const iframe = printIframe.value;
            const pdfUrl = URL.createObjectURL(pdfBlob.value);

            iframe.src = pdfUrl;
            iframe.onload = () => {
                iframe.contentWindow.print();
            };
        };

        const prevPage = () => {
            if (currentPage.value > 1) {
                currentPage.value--;
                currentPageInput.value = currentPage.value;
                renderPage();
            }
        };

        const nextPage = () => {
            if (currentPage.value < totalPages.value) {
                currentPage.value++;
                currentPageInput.value = currentPage.value;
                renderPage();
            }
        };

        const goToPage = () => {
            if (
                currentPageInput.value >= 1 &&
                currentPageInput.value <= totalPages.value
            ) {
                currentPage.value = currentPageInput.value;
                renderPage();
            } else {
                alert('页码超出范围！');
            }
        };

        const zoomIn = () => {
            scale.value += 0.1;
            renderPage();
        };

        const zoomOut = () => {
            scale.value = Math.max(0.1, scale.value - 0.1);
            renderPage();
        };

        return {
            pdfCanvas,
            printIframe,
            pdfBlob,
            currentPage,
            currentPageInput,
            totalPages,
            onFileChange: (e) => loadPdf(e.target.files[0]),
            prevPage,
            nextPage,
            goToPage,
            zoomIn,
            zoomOut,
            downloadPdf,
            printPdf,
        };
    },
};
</script>

<style scoped>
.pdf-viewer {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.file-upload {
    margin-bottom: 1rem;
}

.controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.canvas-container {
    border: 1px solid #ccc;
    padding: 1rem;
    width: 100%;
    display: flex;
    justify-content: center;
}

canvas {
    max-width: 100%;
}
</style>
