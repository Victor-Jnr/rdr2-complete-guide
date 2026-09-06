/** Axis-aligned jeanropke Leaflet (lat,lng) → normalized 0–1 map coords. */

export function tileToNormalized(tileX, tileY, image) {
  return {
    x: (tileX * image.tileSize) / image.width,
    y: (tileY * image.tileSize) / image.height,
  };
}

export function fitAxisAligned(points) {
  const fit1d = (xs, ys) => {
    const n = xs.length;
    let sX = 0;
    let sY = 0;
    let sXX = 0;
    let sXY = 0;
    for (let i = 0; i < n; i += 1) {
      const x = xs[i];
      const y = ys[i];
      sX += x;
      sY += y;
      sXX += x * x;
      sXY += x * y;
    }
    const den = n * sXX - sX * sX;
    const slope = (n * sXY - sX * sY) / den;
    const intercept = (sY - slope * sX) / n;
    return { slope, intercept };
  };
  const xFit = fit1d(
    points.map((p) => p.lng),
    points.map((p) => p.x),
  );
  const yFit = fit1d(
    points.map((p) => p.lat),
    points.map((p) => p.y),
  );
  return { sx: xFit.slope, tx: xFit.intercept, sy: yFit.slope, ty: yFit.intercept };
}

export function solve3(A, b) {
  const m = A.map((row, i) => [...row, b[i]]);
  for (let i = 0; i < 3; i += 1) {
    let max = i;
    for (let r = i + 1; r < 3; r += 1) {
      if (Math.abs(m[r][i]) > Math.abs(m[max][i])) max = r;
    }
    [m[i], m[max]] = [m[max], m[i]];
    const pivot = m[i][i];
    for (let c = i; c < 4; c += 1) m[i][c] /= pivot;
    for (let r = 0; r < 3; r += 1) {
      if (r === i) continue;
      const f = m[r][i];
      for (let c = i; c < 4; c += 1) m[r][c] -= f * m[i][c];
    }
  }
  return [m[0][3], m[1][3], m[2][3]];
}

/** x = a*lng + b*lat + c ; y = d*lng + e*lat + f */
export function fitAffine(points) {
  const rows = points.map((p) => [p.lng, p.lat, 1]);
  const solveAxis = (zs) => {
    const ATA = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    const ATz = [0, 0, 0];
    for (let i = 0; i < rows.length; i += 1) {
      const r = rows[i];
      for (let j = 0; j < 3; j += 1) {
        ATz[j] += r[j] * zs[i];
        for (let k = 0; k < 3; k += 1) ATA[j][k] += r[j] * r[k];
      }
    }
    return solve3(ATA, ATz);
  };
  const [a, b, c] = solveAxis(points.map((p) => p.x));
  const [d, e, f] = solveAxis(points.map((p) => p.y));
  return { kind: 'affine', a, b, c, d, e, f };
}

export function applyTransform(lat, lng, t) {
  if (t.kind === 'affine' || t.a != null) {
    return {
      x: t.a * lng + t.b * lat + t.c,
      y: t.d * lng + t.e * lat + t.f,
    };
  }
  return {
    x: t.sx * lng + t.tx,
    y: t.sy * lat + t.ty,
  };
}

export function residuals(points, t) {
  return points.map((p) => {
    const got = applyTransform(p.lat, p.lng, t);
    const dx = got.x - p.x;
    const dy = got.y - p.y;
    return {
      id: p.id,
      dx,
      dy,
      distance: Math.hypot(dx, dy),
      got,
    };
  });
}

export function rmsDistance(res) {
  return Math.sqrt(res.reduce((s, r) => s + r.distance * r.distance, 0) / res.length);
}
