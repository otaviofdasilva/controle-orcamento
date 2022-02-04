import { EVENTUAL, FIXA } from "../frequencia";
import { ALIMENTACAO
       , EDUCACAO
       , IMPREVISTOS
       , LAZER
       , SAUDE
       , MORADIA
       , OUTRAS
       , TRANSPORTE 
       }                  from "../categoria";

export interface Receita { data:      Date
                         ; descricao: string
                         ; valor:     number
                         }

export interface Despesa { categoria:  typeof ALIMENTACAO
                                    |  typeof EDUCACAO
                                    |  typeof IMPREVISTOS 
                                    |  typeof LAZER
                                    |  typeof SAUDE
                                    |  typeof MORADIA
                                    |  typeof OUTRAS
                                    |  typeof TRANSPORTE

                         ; data:       Date
                         ; descricao:  string
                         ; frequencia: typeof EVENTUAL
                                     | typeof FIXA
                         ; valor:      number
                         }

interface Resumo { despesas:      { ALIMENTACAO: number
                                  ; EDUCACAO:    number
                                  ; IMPREVISTOS: number
                                  ; LAZER:       number
                                  ; SAUDE:       number
                                  ; MORADIA:     number
                                  ; OUTRAS:      number
                                  ; TRANSPORTE:  number
                                  }
                 ; totalReceitas: number
                 ; totalDespesas: number
                 ; saldo:         number
                 }

export interface Repo { destroiTabela(): Promise<void>
                      ; preparaTabela(): Promise<void>
                      ; selecionaDespesa({ descricao }: { descricao: string }): Promise<Despesa[]>
                      ; selecionaDespesa({ id }: { id: number }): Promise<Despesa | null>
                      ; selecionaDespesaPeriodo({ ano, mes }: { ano: number, mes: number }): Promise<Despesa[]>
                      ; selecionaReceita({ id }: { id: number }): Promise<Receita | null>
                      ; selecionaReceita({ descricao }: { descricao: string }): Promise<Receita[]>
                      ; selecionaReceitaPeriodo({ ano, mes }: { ano: number, mes: number }): Promise<Receita[]>
                      ; atualizaDespesa({ id, ...info }: { id: number }): Promise<boolean>
                      ; atualizaReceita({ id, ...info }: { id: number }): Promise<boolean>
                      ; removeReceita({ id }: { id: number }): Promise<boolean>
                      ; removeDespesa({ id }: { id: number }): Promise<boolean>
                      ; cadastraReceita({ data, descricao, valor }: { data: Date, descricao: string, valor: number }): Promise<{ id: number }>
                      ; cadastraDespesa(despesa: Despesa): Promise<{ id: number } & Despesa>
                      ; resumoMovimentacao({ ano, mes }): Promise<Resumo>
                      }