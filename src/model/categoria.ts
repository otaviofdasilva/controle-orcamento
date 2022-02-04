const ALIMENTACAO = "ALIMENTACAO" as const;
const EDUCACAO    = "EDUCACAO" as const;
const IMPREVISTOS = "IMPREVISTOS" as const;
const LAZER       = "LAZER" as const;
const MORADIA     = "MORADIA" as const;
const OUTRAS      = "OUTRAS" as const;
const SAUDE       = "SAUDE" as const;
const TRANSPORTE  = "TRANSPORTE" as const;

const categorias = [ ALIMENTACAO
                   , EDUCACAO
                   , IMPREVISTOS
                   , LAZER
                   , MORADIA
                   , OUTRAS
                   , SAUDE
                   , TRANSPORTE
                   ] as const;

export { ALIMENTACAO, SAUDE, MORADIA, TRANSPORTE, EDUCACAO, LAZER, IMPREVISTOS, OUTRAS, categorias }
