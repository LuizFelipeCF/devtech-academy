// cinema.js
// Lógica compartilhada: classes, storage helpers e utilitários

class Filme {
    constructor(id, titulo, descricao, genero, classificacao, duracao, estreia) {
        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.genero = genero;
        this.classificacao = classificacao;
        this.duracao = parseInt(duracao, 10);
        this.estreia = estreia; // ISO string
    }
    toString() {
        return `${this.titulo} (${this.genero})`;
    }
}

class Sala {
    constructor(id, nome, capacidade, tipo) {
        this.id = id;
        this.nome = nome;
        this.capacidade = parseInt(capacidade, 10);
        this.tipo = tipo;
    }
    toString() {
        return `${this.nome} - ${this.tipo} (${this.capacidade} lugares)`;
    }
}

class Sessao {
    constructor(id, filmeId, salaId, datetimeISO, preco, idioma, formato) {
        this.id = id;
        this.filmeId = filmeId;
        this.salaId = salaId;
        this.datetime = datetimeISO; // ISO
        this.preco = parseFloat(preco);
        this.idioma = idioma;
        this.formato = formato;
    }
    toString() {
        return `Sessão ${this.id} - ${this.datetime}`;
    }
}

class Ingresso {
    constructor(id, sessaoId, cliente, cpf, assento, pagamento, vendidoEmISO) {
        this.id = id;
        this.sessaoId = sessaoId;
        this.cliente = cliente;
        this.cpf = cpf;
        this.assento = assento;
        this.pagamento = pagamento;
        this.vendidoEm = vendidoEmISO || new Date().toISOString();
    }
    toString() {
        return `${this.cliente} - ${this.assento}`;
    }
}

// ---------- Storage helpers ----------
const STORAGE_KEYS = {
    filmes: 'filmes',
    salas: 'salas',
    sessoes: 'sessoes',
    ingressos: 'ingressos'
};

const saveArray = (key, arr) => {
    localStorage.setItem(key, JSON.stringify(arr));
};

const loadArray = (key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
};

const generateId = (prefix = '') => {
    return prefix + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36);
};

// Short helpers to get typed entities
const getFilmes = () => loadArray(STORAGE_KEYS.filmes);
const getSalas = () => loadArray(STORAGE_KEYS.salas);
const getSessoes = () => loadArray(STORAGE_KEYS.sessoes);
const getIngressos = () => loadArray(STORAGE_KEYS.ingressos);

const setFilmes = (arr) => saveArray(STORAGE_KEYS.filmes, arr);
const setSalas = (arr) => saveArray(STORAGE_KEYS.salas, arr);
const setSessoes = (arr) => saveArray(STORAGE_KEYS.sessoes, arr);
const setIngressos = (arr) => saveArray(STORAGE_KEYS.ingressos, arr);

// Utility: format datetime for display
const formatDateTime = (iso) => {
    try {
        const d = new Date(iso);
        return d.toLocaleString();
    } catch {
        return iso;
    }
};

// Utility: parse query string
const getQueryParams = () => {
    const params = {};
    const query = location.search.replace(/^\?/, '');
    if (!query) return params;
    query.split('&').forEach(pair => {
        const [k, v] = pair.split('=');
        params[decodeURIComponent(k)] = decodeURIComponent(v || '');
    });
    return params;
};

// Expose
window.Cinema = {
    Filme, Sala, Sessao, Ingresso,
    getFilmes, getSalas, getSessoes, getIngressos,
    setFilmes, setSalas, setSessoes, setIngressos,
    generateId, formatDateTime, getQueryParams
};
