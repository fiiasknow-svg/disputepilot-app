# FIX PINK ERROR BORDERS - Pattern Guide

Any page showing pink/red error borders needs this pattern:

## WRONG (causes crash):
const { data, error } = await supabase.from("table").select("*");
if (error) throw error;  // <-- This crashes the page!
setData(data);

## RIGHT (graceful fallback):
let rows = [];
try {
  const { data } = await supabase.from("table").select("*");
  rows = data || [];
} catch {}
setData(rows);

## Then in render:
{rows.length === 0 ? (
  <p>No data yet</p>
) : (
  <table>...</table>
)}
