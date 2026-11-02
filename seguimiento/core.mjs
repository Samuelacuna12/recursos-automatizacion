export const HEADERS=['id','empresa','etapa','ultima_interaccion','proxima_accion','no_contactar'];
export function parseCSV(text){
  text=String(text).replace(/^\uFEFF/,'');
  if(text.length>1000000)throw Error('El archivo supera 1 MB. Divide la lista antes de cargarla.');
  const first=text.split(/\r?\n/)[0];let commas=0,semis=0,q=false;
  for(let i=0;i<first.length;i++){if(first[i]==='"')q=!q;else if(!q&&first[i]===',')commas++;else if(!q&&first[i]===';')semis++;}
  const sep=semis>commas?';':',';let rows=[],row=[],cell='',quoted=false,closed=false;
  const field=()=>{row.push(cell.trim());cell='';closed=false;};
  const line=()=>{field();if(row.some(v=>v!==''))rows.push(row);row=[];};
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=c;continue;}
    if(c==='"'){if(cell.trim()||closed)throw Error('Comillas mal ubicadas en el CSV. Exporta de nuevo desde tu hoja.');quoted=true;cell='';}
    else if(c===sep)field();
    else if(c==='\n'){line();}
    else if(c==='\r'){if(text[i+1]==='\n')i++;line();}
    else if(closed&&!/\s/.test(c))throw Error('Hay texto después del cierre de comillas.');
    else if(!closed)cell+=c;
  }
  if(quoted)throw Error('Hay una celda con comillas sin cerrar.');
  if(cell||row.length||closed)line();
  if(rows.length<2)throw Error('Incluye encabezados y al menos una cotización.');
  if(rows.length>2001)throw Error('Esta herramienta admite hasta 2.000 registros por archivo.');
  const headers=rows.shift().map(h=>h.toLowerCase());
  if(new Set(headers).size!==headers.length)throw Error('Hay encabezados duplicados.');
  const missing=HEADERS.filter(h=>!headers.includes(h));if(missing.length)throw Error('Faltan columnas: '+missing.join(', ')+'. Descarga la plantilla.');
  return rows.map((r,i)=>{if(r.length!==headers.length)throw Error('La fila '+(i+2)+' no tiene la misma cantidad de columnas que el encabezado.');return Object.fromEntries(headers.map((h,j)=>[h,r[j]]));});
}
export function dateValue(value){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return null;
 const d=new Date(value+'T00:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===value?+d:null;
}
export const LABELS={vencida:'Vencida',hoy:'Para hoy',agendada:'Agendada',definir:'Definir próxima acción',revisar:'Revisar datos',excluir:'No contactar',cerrada:'Cerrada'};
export function analyze(records,today){
 const now=dateValue(today);if(now===null)throw Error('Elige una fecha de revisión válida.');
 const ids=new Map();for(const r of records)ids.set(r.id,(ids.get(r.id)||0)+1);
 return records.map((r,index)=>{
  const stage=(r.etapa||'').toLowerCase().trim(),flag=(r.no_contactar||'').toLowerCase().trim();let status,reason;
  if(['si','sí','true','1'].includes(flag)||stage==='perdido'){status='excluir';reason=stage==='perdido'?'Marcada como perdida. Revisar contexto antes de cualquier nueva acción.':'La lista indica no contactar. Mantener excluida.';}
  else if(stage==='ganado'){status='cerrada';reason='Venta marcada como ganada en el archivo; no se verificó pago.';}
  else if(!r.id||!r.empresa||ids.get(r.id)>1){status='revisar';reason=!r.id||!r.empresa?'Falta ID o empresa.':'ID duplicado: revisar ambas filas, no sumar como dos oportunidades.';}
  else if(!['nuevo','cotizado','en_negociacion'].includes(stage)||!['no','false','0',''].includes(flag)){status='revisar';reason='Revisar etapa o valor no_contactar según la plantilla.';}
  else if(!r.ultima_interaccion||dateValue(r.ultima_interaccion)===null||dateValue(r.ultima_interaccion)>now){status='revisar';reason='Última interacción vacía, inválida o posterior a la fecha de revisión.';}
  else if(!r.proxima_accion){status='definir';reason='Falta una fecha de próxima acción. Definirla con el responsable; no asumir que toca escribir hoy.';}
  else if(dateValue(r.proxima_accion)===null||dateValue(r.proxima_accion)<dateValue(r.ultima_interaccion)){status='revisar';reason='Fecha de próxima acción inválida o anterior a la última interacción.';}
  else if(dateValue(r.proxima_accion)<now){status='vencida';reason='La acción acordada quedó pendiente. Leer el historial antes de decidir el contacto.';}
  else if(dateValue(r.proxima_accion)===now){status='hoy';reason='Fecha de acción programada para hoy. Confirmar contexto, canal y responsable.';}
  else{status='agendada';reason='Tiene una fecha futura. No adelantar el contacto automáticamente.';}
  const days=dateValue(r.proxima_accion)===null?null:Math.max(0,Math.round((now-dateValue(r.proxima_accion))/86400000));
  return {...r,row:index+2,status,label:LABELS[status],reason,daysLate:days};
 }).sort((a,b)=>['vencida','hoy','definir','revisar','agendada','excluir','cerrada'].indexOf(a.status)-['vencida','hoy','definir','revisar','agendada','excluir','cerrada'].indexOf(b.status)||(b.daysLate||0)-(a.daysLate||0));
}
export function exportCSV(rows){
 const cols=[...HEADERS,'clasificacion','motivo'];
 const safe=v=>{let s=String(v??'');if(/^[\s]*[=+@-]/.test(s)||/^[\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
 return '\uFEFF'+[cols,...rows.map(r=>[...HEADERS.map(h=>r[h]),r.label,r.reason])].map(r=>r.map(safe).join(',')).join('\r\n');
}
export function exampleCSV(today){
 const d=dateValue(today);if(d===null)throw Error('Elige una fecha de revisión válida.');const day=n=>new Date(d+n*86400000).toISOString().slice(0,10);
 return HEADERS.join(',')+'\n'+[
 ['EJ-01','Tienda Ejemplo A','cotizado',day(-8),day(-3),'no'],
 ['EJ-02','Taller Ejemplo B','en_negociacion',day(-2),today,'no'],
 ['EJ-03','Marca Ejemplo C','cotizado',day(-3),day(3),'no'],
 ['EJ-04','Distribuidor Ejemplo D','nuevo',day(-1),'','no'],
 ['EJ-05','Negocio Ejemplo E','cotizado',day(-7),day(-1),'si'],
 ['EJ-06','Comercio Ejemplo F','ganado',day(-2),'','no']].map(r=>r.join(',')).join('\n');
}
