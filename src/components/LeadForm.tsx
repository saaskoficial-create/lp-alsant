import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import {
  leadSchema,
  patientVolumeOptions,
  examFrequencyOptions,
  recordVolumeOptions,
  type LeadInput,
  type LeadValues,
} from '@/lib/lead-schema';

const unavailable = 'Não foi possível enviar sua solicitação agora. Tente novamente mais tarde.';
export default function LeadForm() {
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  const lock = useRef(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadInput, unknown, LeadValues>({
    resolver: zodResolver(leadSchema),
    mode: 'onBlur',
  });
  const fields = [
    {
      name: 'fullName',
      label: 'Nome completo',
      placeholder: 'Digite seu nome',
      autoComplete: 'name',
      type: 'text',
      maxLength: 120,
    },
    {
      name: 'email',
      label: 'E-mail profissional',
      placeholder: 'Digite seu e-mail',
      autoComplete: 'email',
      type: 'email',
      maxLength: 254,
    },
    {
      name: 'phone',
      label: 'WhatsApp',
      placeholder: 'Digite seu telefone',
      autoComplete: 'tel',
      type: 'tel',
      maxLength: 40,
    },
    {
      name: 'clinic',
      label: 'Nome da clínica / consultório',
      placeholder: 'Digite o nome',
      autoComplete: 'organization',
      type: 'text',
      maxLength: 160,
    },
  ] as const;
  const selects = [
    {
      name: 'patientVolume',
      label: 'Quantos pacientes você atende por mês?',
      options: patientVolumeOptions,
    },
    {
      name: 'examFrequency',
      label: 'Com que frequência você utiliza exames laboratoriais?',
      options: examFrequencyOptions,
    },
    {
      name: 'recordVolume',
      label: 'Quantos prontuários/pacientes você gerencia atualmente?',
      options: recordVolumeOptions,
    },
  ] as const;
  async function submit(values: LeadValues) {
    if (lock.current) return;
    lock.current = true;
    setPending(true);
    setStatus('idle');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    try {
      const params = new URLSearchParams(window.location.search);
      const utm = Object.fromEntries(
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
          .filter((key) => params.has(key))
          .map((key) => [key, params.get(key)?.slice(0, 200)]),
      );
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, utm }),
        signal: controller.signal,
      });
      const data: { ok?: boolean } = await response.json();
      if (!response.ok || data.ok !== true) throw new Error('delivery_failed');
      setStatus('success');
      setMessage(
        'Solicitação recebida! Nosso time entrará em contato para agendar sua demonstração.',
      );
    } catch {
      setStatus('error');
      setMessage(unavailable);
    } finally {
      window.clearTimeout(timeout);
      lock.current = false;
      setPending(false);
      window.requestAnimationFrame(() => statusRef.current?.focus());
    }
  }
  return (
    <form
      className="lead-form"
      method="post"
      action="/api/leads"
      onSubmit={handleSubmit(submit)}
      noValidate
      aria-label="Solicitar demonstração"
      aria-busy={pending}
    >
      {status !== 'success' && (
        <>
          <div className="form-grid">
            {fields.map((field) => (
              <div className="form-field" key={field.name}>
                <Label htmlFor={field.name}>{field.label}</Label>
                <Input
                  {...register(field.name)}
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  maxLength={field.maxLength}
                  required
                  aria-invalid={!!errors[field.name]}
                  aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
                />
                {errors[field.name] && (
                  <p className="field-error" id={`${field.name}-error`}>
                    {errors[field.name]?.message}
                  </p>
                )}
              </div>
            ))}
          </div>
          {selects.map((field) => (
            <div className="form-field" key={field.name}>
              <Label htmlFor={field.name}>{field.label}</Label>
              <NativeSelect
                {...register(field.name)}
                id={field.name}
                defaultValue=""
                required
                aria-invalid={!!errors[field.name]}
                aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
              >
                <option value="" disabled>
                  Selecione uma opção
                </option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </NativeSelect>
              {errors[field.name] && (
                <p className="field-error" id={`${field.name}-error`}>
                  {errors[field.name]?.message}
                </p>
              )}
            </div>
          ))}
          <div className="honeypot" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" {...register('website')} tabIndex={-1} autoComplete="off" />
          </div>
          <Button className="form-submit" type="submit" disabled={!ready || pending}>
            {pending ? (
              <>
                Enviando solicitação… <LoaderCircle size={18} aria-hidden="true" />
              </>
            ) : (
              <>
                Quero agendar minha demonstração <ArrowRight size={18} aria-hidden="true" />
              </>
            )}
          </Button>
        </>
      )}
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className={
          status === 'idle' ? 'sr-only' : `form-status ${status === 'success' ? 'success' : ''}`
        }
      >
        {message}
      </div>
      <p className="form-microcopy">
        Nosso time entrará em contato para entender sua rotina e apresentar como a Biosenz pode ser
        aplicada no seu atendimento.
      </p>
      <p className="form-privacy">
        Seus dados serão utilizados para este contato. Consulte a{' '}
        <a href="https://biosenz.ai/privacy">Política de Privacidade</a>.
      </p>
    </form>
  );
}
