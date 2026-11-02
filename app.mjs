import {parseCSV,analyze,exampleCSV,exportCSV,LABELS,dateValue} from './seguimiento/core.mjs';
const $=s=>document.querySelector(s);let original=[],result=[],source='';
const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Bogota',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
const get=k=>parts.find(x=>x.type===k).value;$('#review-date').value=get('year')+'-'+get('month')+'-'+get('day');
const download=(content,name,type)=>{const u=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};
const error=e=>{if(dateValue($('#review-date').value)===null)$('#export').disabled=true;$('#alert').hidden=false;$('#alert').textContent=e.message;};
function filtered(){const f=$('#filter').value;return result.filter(r=>f==='all'||(f==='action'?['vencida','hoy'].includes(r.status):r.status===f));}
function render(){
 const shown=filtered();$('#rows').replaceChildren();
 for(const r of shown){const tr=document.createElement('tr'),name=document.createElement('td'),id=document.createElement('small');name.append(document.createTextNode(r.empresa||'Empresa por identificar'));id.textContent=(r.id||'Sin ID')+' · '+(r.etapa||'Sin etapa');name.append(id);tr.append(name);
 const state=document.createElement('td'),badge=document.createElement('span');badge.className='badge '+r.status;badge.textContent=LABELS[r.status];state.append(badge);tr.append(state);
 const date=document.createElement('td');date.textContent=r.proxima_accion||'Sin fecha';if(r.status==='vencida'){const late=document.createElement('small');late.textContent=r.daysLate+' día(s) pendiente';date.append(late);}tr.append(date);
 const why=document.createElement('td');why.textContent=r.reason;tr.append(why);$('#rows').append(tr);}
 if(!shown.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=4;td.className='empty';td.textContent=result.length?'No hay registros en esta vista.':'Carga un CSV o prueba el ejemplo para ver la lista de trabajo.';tr.append(td);$('#rows').append(tr);}
 const groups=[['vencida','hoy'],['definir','revisar'],['excluir','cerrada'],['agendada']];document.querySelectorAll('#metrics strong').forEach((el,i)=>el.textContent=result.length?result.filter(r=>groups[i].includes(r.status)).length:'—');$('#row-count').textContent=shown.length+' de '+result.length+' registros';$('#export').disabled=!shown.length||dateValue($('#review-date').value)===null;$('#clear').disabled=!result.length;
}
function load(text,label){try{const next=parseCSV(text),checked=analyze(next,$('#review-date').value);original=next;result=checked;source=label;$('#alert').hidden=true;$('#filter').value='all';$('#notice').textContent=label+' · '+result.length+' registros. Clasificados para '+$('#review-date').value+'. Ningún mensaje enviado.';render();}catch(e){error(e);}}
$('#sample').addEventListener('click',()=>{try{load(exampleCSV($('#review-date').value),'Ejemplo ficticio');}catch(e){error(Error('Elige una fecha de revisión válida.'));}});
$('#upload').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;if(f.size>1000000){error(Error('El archivo supera 1 MB.'));return;}try{load(await f.text(),'Archivo cargado');}catch(err){error(err);}e.target.value='';});
$('#review-date').addEventListener('change',()=>{if(!original.length)return;try{result=analyze(original,$('#review-date').value);$('#alert').hidden=true;$('#notice').textContent=source+' · Recalculado para '+$('#review-date').value+'. Ningún mensaje enviado.';render();}catch(e){error(e);}});
$('#filter').addEventListener('change',render);$('#export').addEventListener('click',()=>{download(exportCSV(filtered()),'seguimiento-'+$('#review-date').value+'.csv','text/csv;charset=utf-8');$('#notice').textContent='Vista exportada. Revisa el historial y asigna un responsable antes de contactar.';});
$('#template').addEventListener('click',()=>{try{download(exampleCSV($('#review-date').value),'plantilla-cotizaciones.csv','text/csv;charset=utf-8');$('#notice').textContent='Plantilla preparada con seis ejemplos ficticios. Sustitúyelos por tus registros.';}catch(e){error(Error('Elige una fecha válida para crear la plantilla.'));}});
$('#clear').addEventListener('click',()=>{original=[];result=[];source='';$('#alert').hidden=true;$('#notice').textContent='Lista eliminada de esta página. Puedes cargar otra.';render();});
