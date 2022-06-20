{
  function merge(lhs, rhs, ...rest) {
    if (!rhs) return lhs;
    for (const key of Object.keys(rhs))
      rhs[key] instanceof Object &&
        Object.assign(rhs[key], merge(lhs[key], rhs[key]));
    return merge({ ...lhs, ...rhs }, ...rest);
  };
}

Expression
  = m:Op* { return m.reduce( (s, [k,v]) => {
  	s[k] = merge(v,s[k]||{});
    return s;
  }, {})}

Op
  = op:(
      (e:(Author / Channel / Since / Until) {return ['filter', e]}) /
      (e:(Newer / Older) {return ['options', e]}) /
      (e:(Only) { return ['projection', e]})
    ) sep? { return op }

Author
  = "a" "uthor"? _ v:Char+ { return {authorChannelId: v.join('')} }

Channel
  = "c" "hannel"? _ v:Char+ { return {originChannelId: v.join('')} }

Since
  = ("since" / "from") _ v:Time { return {timestamp: {$gte: v}} }

Until
  = ("until" / "to") _ v:Time { return {timestamp: {$lte: v}} }

Time =
  "-"? n:([0-9]+{return text()}) unit:[yMdhms] { return new Date(Date.now() - (Number(n) * {'s': 1, 'm': 60, 'h': 3600}[unit] * 1000)) } / "now" {return new Date()}

Newer =
  "newer" "er"? _ v:(n:[0-9]+ { return Number(n.join('')) }) { return {limit: v, sort: {timestamp: -1}} }

Older =
  "old" "er"? _ v:(n:[0-9]+ { return Number(n.join('')) }) { return {limit: v, sort: {timestamp: 1}} }

Only =
  "only" _ ent:(v:(Char+ { return text() }) (_ "and" _)? { return [v,1] })* {return Object.fromEntries(ent) }

Char = [^ \r\n]

sep
  = [ \t\n\r]+

_ "whitespace"
  = [ \t]
