import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioMessagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

/**
 * Vamos trabalhar em 2 modos:
 * - MODO REAL: todas as variáveis do Twilio estão preenchidas → envia SMS
 * - MODO SIMULADO: alguma variável faltando → apenas loga o código e devolve true
 */
const hasRealTwilio =
  !!accountSid && !!authToken && (!!twilioPhoneNumber || !!twilioMessagingServiceSid);

if (!hasRealTwilio) {
  console.warn(
    "[Twilio] Credenciais incompletas. Rodando em modo SIMULADO (não envia SMS de verdade)."
  );
}

const client = hasRealTwilio ? twilio(accountSid as string, authToken as string) : null;

/**
 * Normaliza número do Brasil para E.164
 */
function normalizeBrazilPhone(raw: string): string {
  const cleaned = raw.replace(/[^0-9+]/g, "");

  // já está no formato internacional
  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  // começa com 55 mas sem +
  if (cleaned.startsWith("55")) {
    return `+${cleaned}`;
  }

  // se veio 11 dígitos (ex: 94981135236) → +55 94981135236
  if (cleaned.length === 11) {
    return `+55${cleaned}`;
  }

  // se veio 10 dígitos (sem o 9) → +55 + número
  if (cleaned.length === 10) {
    return `+55${cleaned}`;
  }

  // fallback: prefixa +55 sempre
  return `+55${cleaned}`;
}

/**
 * Gera código de 6 dígitos
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Envia SMS (real ou simulado)
 */
export async function sendSMS(to: string, code: string): Promise<boolean> {
  const formattedPhone = normalizeBrazilPhone(to);

  // modo simulado
  if (!hasRealTwilio || !client) {
    console.log("[Twilio][SIMULATED] Enviar para:", formattedPhone, "código:", code);
    return true;
  }

  try {
    const payload: any = {
      body: `Seu código de verificação Halloween777 é: ${code}. Válido por 5 minutos.`,
      to: formattedPhone,
    };

    // se tiver messaging service, usa ele
    if (twilioMessagingServiceSid) {
      payload.messagingServiceSid = twilioMessagingServiceSid;
    } else {
      payload.from = twilioPhoneNumber;
    }

    const message = await client.messages.create(payload);

    console.log("[Twilio] SMS enviado. SID:", message.sid);
    return true;
  } catch (error: any) {
    console.error("[Twilio] Falha ao enviar SMS:", error.message || error);
    return false;
  }
}

/**
 * Expira em 5 minutos
 */
export function getExpirationTime(): Date {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5);
  return now;
}
