import React from 'react';
import { CertificationState, TrainingStatus, NovedadStatus } from '../../types/database';

interface BadgeProps {
  status?: CertificationState | TrainingStatus | NovedadStatus | 'activo' | 'inactivo' | string;
  label?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, label, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm font-medium';

  let colorClasses = 'bg-slate-100 text-slate-700 border border-slate-200';
  let displayLabel = label || status || '';

  switch (status) {
    // Certification states
    case 'vigente':
      colorClasses = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      displayLabel = label || 'Certificado Vigente';
      break;
    case 'proximo_vencer':
      colorClasses = 'bg-amber-50 text-amber-800 border border-amber-300';
      displayLabel = label || 'Próximo a Vencer';
      break;
    case 'vencido':
      colorClasses = 'bg-rose-50 text-rose-700 border border-rose-200';
      displayLabel = label || 'Certificado Vencido';
      break;
    case 'no_certificado':
      colorClasses = 'bg-slate-100 text-slate-600 border border-slate-300';
      displayLabel = label || 'No Certificado';
      break;

    // Training status
    case 'realizada':
      colorClasses = 'bg-blue-50 text-blue-700 border border-blue-200';
      displayLabel = label || 'Realizada';
      break;
    case 'programada':
      colorClasses = 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      displayLabel = label || 'Programada';
      break;
    case 'cancelada':
      colorClasses = 'bg-red-50 text-red-600 border border-red-200';
      displayLabel = label || 'Cancelada';
      break;

    // Novedad status
    case 'abierta':
      colorClasses = 'bg-rose-50 text-rose-700 border border-rose-200';
      displayLabel = label || 'Abierta';
      break;
    case 'en_seguimiento':
      colorClasses = 'bg-amber-50 text-amber-800 border border-amber-200';
      displayLabel = label || 'En Seguimiento';
      break;
    case 'cerrada':
      colorClasses = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      displayLabel = label || 'Cerrada';
      break;

    // General Active/Inactive
    case 'activo':
      colorClasses = 'bg-teal-50 text-teal-700 border border-teal-200';
      displayLabel = label || 'Activo';
      break;
    case 'inactivo':
      colorClasses = 'bg-slate-100 text-slate-500 border border-slate-200';
      displayLabel = label || 'Inactivo';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full tracking-wide whitespace-nowrap ${sizeClasses} ${colorClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {displayLabel}
    </span>
  );
};
