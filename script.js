let ultimaPosicaoScroll = window.pageYOffset;
const header = document.querySelector('header');
const btnTopo = document.getElementById('btnTopo');

window.addEventListener('scroll', function() {
    let posicaoAtualScroll = window.pageYOffset;

    // Esconde o cabeçalho ao rolar para baixo e mostra ao rolar para cima (só no celular)
    if (window.innerWidth <= 768) {
        if (posicaoAtualScroll > ultimaPosicaoScroll && posicaoAtualScroll > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
    } else {
        // No computador, o cabeçalho fica sempre visível
        header.style.transform = 'translateY(0)';
    }

    // Mostra ou esconde o botão de "Voltar ao topo"
    if (posicaoAtualScroll > 200) {
        btnTopo.classList.add('mostrar');
    } else {
        btnTopo.classList.remove('mostrar');
    }

    ultimaPosicaoScroll = posicaoAtualScroll;
});

// ===== Galeria em carrossel infinito =====
// A rolagem automática, as setas e o arraste usam o mesmo mecanismo (scroll).
// As imagens precisam estar duplicadas no HTML (bloco original + cópia).
const track = document.querySelector('.galeria-track');
const containerGaleria = document.querySelector('.galeria-container');
const wrapperGaleria = document.querySelector('.galeria-wrapper');
const btnEsquerda = document.querySelector('.btn-seta.esquerda');
const btnDireita = document.querySelector('.btn-seta.direita');

if (track && containerGaleria && wrapperGaleria && btnEsquerda && btnDireita) {
    const VELOCIDADE = 60; 
    const imagens = track.children;
    const metade = imagens.length / 2; // metade original + metade cópia

    // Medidas lidas da própria página: não dependem de números fixos
    const larguraBloco = () => imagens[metade].offsetLeft - imagens[0].offsetLeft;
    const passoImagem = () => imagens[1].offsetLeft - imagens[0].offsetLeft;
    const irPara = (x) => containerGaleria.scrollTo({ left: x, behavior: 'instant' });

    // Mantém a posição no meio da pista, onde sempre há imagens dos dois lados.
    // O bloco e a cópia são idênticos, então o salto de um bloco inteiro não aparece.
    function normalizar() {
        const bloco = larguraBloco();
        const x = containerGaleria.scrollLeft;
        if (x >= bloco * 1.5) irPara(x - bloco);
        else if (x < bloco * 0.5) irPara(x + bloco);
    }

    let sobMouse = false;   // mouse em cima da galeria
    let tocando = false;    // dedo na galeria
    let pausaAte = 0;       // depois de usar as setas, espera 2 s para voltar a rolar sozinha
    let posicao = 0;
    let ultimoTempo = null;
    const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const pausado = () => sobMouse || tocando || performance.now() < pausaAte;

    function passo(tempo) {
        if (ultimoTempo !== null) {
            const dt = Math.min((tempo - ultimoTempo) / 1000, 0.1);
            if (pausado()) {
                posicao = containerGaleria.scrollLeft; // continua de onde a pessoa parou
            } else {
                posicao += VELOCIDADE * dt;
                const bloco = larguraBloco();
                if (posicao >= bloco * 1.5) posicao -= bloco;
                irPara(posicao);
            }
        }
        ultimoTempo = tempo;
        requestAnimationFrame(passo);
    }

    function moverComSeta(direcao) {
        pausaAte = performance.now() + 2000;
        containerGaleria.scrollBy({ left: direcao * passoImagem(), behavior: 'smooth' });
    }

    btnDireita.addEventListener('click', () => moverComSeta(1));
    btnEsquerda.addEventListener('click', () => moverComSeta(-1));

    // Mouse em cima pausa; tirar o mouse retoma (só vale para mouse, não para toque)
    wrapperGaleria.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') sobMouse = true; });
    wrapperGaleria.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') sobMouse = false; });

    // Dedo na galeria pausa; ao soltar, espera 2 s para voltar a rolar sozinha
    containerGaleria.addEventListener('touchstart', () => { tocando = true; }, { passive: true });
    const soltou = () => { tocando = false; pausaAte = performance.now() + 2000; };
    containerGaleria.addEventListener('touchend', soltou, { passive: true });
    containerGaleria.addEventListener('touchcancel', soltou, { passive: true });

    // Quando a rolagem para, volta para o meio da pista; se chegar perto de uma ponta, corrige na hora
    let temporizadorNormalizar;
    containerGaleria.addEventListener('scroll', () => {
        const bloco = larguraBloco();
        const x = containerGaleria.scrollLeft;
        const limiteMax = 2 * bloco - containerGaleria.clientWidth - 40;
        if (x > limiteMax) irPara(x - bloco);
        else if (x < 40) irPara(x + bloco);
        clearTimeout(temporizadorNormalizar);
        temporizadorNormalizar = setTimeout(normalizar, 150);
    });
    window.addEventListener('resize', normalizar);

    normalizar();
    posicao = containerGaleria.scrollLeft;
    if (!reduzirMovimento) requestAnimationFrame(passo);
}