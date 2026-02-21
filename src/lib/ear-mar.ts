// EAR (Eye Aspect Ratio) and MAR (Mouth Aspect Ratio) calculations
// Based on MediaPipe Face Mesh landmark indices

// Eye landmarks for EAR calculation
const LEFT_EYE_INDICES = {
  top: [159, 145],
  bottom: [23, 130],
  left: 33,
  right: 133,
  vertical1: { top: 159, bottom: 145 },
  vertical2: { top: 158, bottom: 153 },
  horizontal: { left: 33, right: 133 },
};

const RIGHT_EYE_INDICES = {
  vertical1: { top: 386, bottom: 374 },
  vertical2: { top: 385, bottom: 380 },
  horizontal: { left: 362, right: 263 },
};

// Mouth landmarks for MAR calculation  
const MOUTH_INDICES = {
  vertical1: { top: 13, bottom: 14 },
  vertical2: { top: 82, bottom: 87 },
  vertical3: { top: 312, bottom: 317 },
  horizontal: { left: 78, right: 308 },
};

interface Point3D {
  x: number;
  y: number;
  z: number;
}

function distance(p1: Point3D, p2: Point3D): number {
  return Math.sqrt(
    (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z - p2.z) ** 2
  );
}

export function calculateEAR(landmarks: Point3D[]): number {
  // Left eye
  const leftV1 = distance(
    landmarks[LEFT_EYE_INDICES.vertical1.top],
    landmarks[LEFT_EYE_INDICES.vertical1.bottom]
  );
  const leftV2 = distance(
    landmarks[LEFT_EYE_INDICES.vertical2.top],
    landmarks[LEFT_EYE_INDICES.vertical2.bottom]
  );
  const leftH = distance(
    landmarks[LEFT_EYE_INDICES.horizontal.left],
    landmarks[LEFT_EYE_INDICES.horizontal.right]
  );
  const leftEAR = (leftV1 + leftV2) / (2.0 * leftH);

  // Right eye
  const rightV1 = distance(
    landmarks[RIGHT_EYE_INDICES.vertical1.top],
    landmarks[RIGHT_EYE_INDICES.vertical1.bottom]
  );
  const rightV2 = distance(
    landmarks[RIGHT_EYE_INDICES.vertical2.top],
    landmarks[RIGHT_EYE_INDICES.vertical2.bottom]
  );
  const rightH = distance(
    landmarks[RIGHT_EYE_INDICES.horizontal.left],
    landmarks[RIGHT_EYE_INDICES.horizontal.right]
  );
  const rightEAR = (rightV1 + rightV2) / (2.0 * rightH);

  return (leftEAR + rightEAR) / 2.0;
}

export function calculateMAR(landmarks: Point3D[]): number {
  const v1 = distance(
    landmarks[MOUTH_INDICES.vertical1.top],
    landmarks[MOUTH_INDICES.vertical1.bottom]
  );
  const v2 = distance(
    landmarks[MOUTH_INDICES.vertical2.top],
    landmarks[MOUTH_INDICES.vertical2.bottom]
  );
  const v3 = distance(
    landmarks[MOUTH_INDICES.vertical3.top],
    landmarks[MOUTH_INDICES.vertical3.bottom]
  );
  const h = distance(
    landmarks[MOUTH_INDICES.horizontal.left],
    landmarks[MOUTH_INDICES.horizontal.right]
  );

  return (v1 + v2 + v3) / (2.0 * h);
}
