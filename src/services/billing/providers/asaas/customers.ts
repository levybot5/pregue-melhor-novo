import "server-only";
import { asaasRequest } from "./client";

// https://docs.asaas.com/reference/create-new-customer
// name + cpfCnpj são os únicos campos realmente obrigatórios — usados
// só para gerar a cobrança PIX direta (não para o checkout de cartão,
// que é hospedado e não precisa disso). externalReference guarda o id
// da nossa pending_purchase, útil pra conciliação manual.
export type CreateAsaasCustomerInput = {
  name: string;
  cpfCnpj: string;
  email?: string;
  externalReference?: string;
};

export type AsaasCustomer = {
  id: string;
  name: string;
  cpfCnpj: string;
};

export async function createAsaasCustomer(
  input: CreateAsaasCustomerInput,
): Promise<AsaasCustomer> {
  return asaasRequest<AsaasCustomer>("POST", "/customers", {
    name: input.name,
    cpfCnpj: input.cpfCnpj.replace(/\D/g, ""),
    email: input.email,
    externalReference: input.externalReference,
  });
}
