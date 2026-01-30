/**
 * Tests for Image Blacklist Utilities
 */

import {
  normalizeImgurUrl,
  isBlacklistedImage,
  draftContainsBlacklistedImage,
  findBlacklistedImages,
} from '../image-blacklist';

describe('normalizeImgurUrl', () => {
  it('should normalize imgur.com URLs', () => {
    expect(normalizeImgurUrl('https://imgur.com/e8dN5uA')).toBe('e8dN5uA');
    expect(normalizeImgurUrl('http://imgur.com/e8dN5uA')).toBe('e8dN5uA');
    expect(normalizeImgurUrl('https://www.imgur.com/e8dN5uA')).toBe('e8dN5uA');
  });

  it('should normalize i.imgur.com URLs', () => {
    expect(normalizeImgurUrl('https://i.imgur.com/e8dN5uA.jpg')).toBe('e8dN5uA');
    expect(normalizeImgurUrl('https://i.imgur.com/e8dN5uA.png')).toBe('e8dN5uA');
    expect(normalizeImgurUrl('https://i.imgur.com/e8dN5uA.gif')).toBe('e8dN5uA');
    expect(normalizeImgurUrl('http://i.imgur.com/e8dN5uA.webp')).toBe('e8dN5uA');
  });

  it('should handle URLs with different cases', () => {
    expect(normalizeImgurUrl('HTTPS://IMGUR.COM/e8dN5uA')).toBe('e8dN5uA');
    expect(normalizeImgurUrl('HTTPS://I.IMGUR.COM/e8dN5uA.JPG')).toBe('e8dN5uA');
  });

  it('should return null for non-imgur URLs', () => {
    expect(normalizeImgurUrl('https://example.com/image.jpg')).toBeNull();
    expect(normalizeImgurUrl('https://google.com')).toBeNull();
    expect(normalizeImgurUrl('')).toBeNull();
  });

  it('should return null for invalid URLs', () => {
    expect(normalizeImgurUrl('not-a-url')).toBeNull();
    expect(normalizeImgurUrl('imgur.com')).toBeNull(); // Missing protocol is handled
  });
});

describe('isBlacklistedImage', () => {
  it('should detect blacklisted imgur URLs', () => {
    expect(isBlacklistedImage('https://imgur.com/e8dN5uA')).toBe(true);
    expect(isBlacklistedImage('https://i.imgur.com/e8dN5uA.jpg')).toBe(true);
    expect(isBlacklistedImage('http://imgur.com/e8dN5uA')).toBe(true);
  });

  it('should not detect non-blacklisted imgur URLs', () => {
    expect(isBlacklistedImage('https://imgur.com/ABC123')).toBe(false);
    expect(isBlacklistedImage('https://i.imgur.com/XYZ789.jpg')).toBe(false);
  });

  it('should handle case sensitivity correctly', () => {
    expect(isBlacklistedImage('https://imgur.com/E8DN5UA')).toBe(true); // Case insensitive
    expect(isBlacklistedImage('https://IMGUR.COM/e8dN5uA')).toBe(true);
  });

  it('should handle empty or invalid URLs', () => {
    expect(isBlacklistedImage('')).toBe(false);
    expect(isBlacklistedImage('not-a-url')).toBe(false);
  });
});

describe('draftContainsBlacklistedImage', () => {
  it('should detect blacklisted image in og_image', () => {
    const draft = {
      og_image: 'https://imgur.com/e8dN5uA',
      template_config: null,
    };
    expect(draftContainsBlacklistedImage(draft)).toBe(true);
  });

  it('should detect blacklisted image in template_config.imageUrl', () => {
    const draft = {
      og_image: null,
      template_config: {
        imageUrl: 'https://i.imgur.com/e8dN5uA.jpg',
      },
    };
    expect(draftContainsBlacklistedImage(draft)).toBe(true);
  });

  it('should detect blacklisted image in template_config.images array', () => {
    const draft = {
      og_image: null,
      template_config: {
        images: [
          'https://imgur.com/ABC123',
          'https://imgur.com/e8dN5uA',
          'https://imgur.com/XYZ789',
        ],
      },
    };
    expect(draftContainsBlacklistedImage(draft)).toBe(true);
  });

  it('should return false when no blacklisted images found', () => {
    const draft = {
      og_image: 'https://imgur.com/SafeImage',
      template_config: {
        imageUrl: 'https://imgur.com/AnotherSafe',
        images: ['https://imgur.com/Safe1', 'https://imgur.com/Safe2'],
      },
    };
    expect(draftContainsBlacklistedImage(draft)).toBe(false);
  });

  it('should handle drafts with no images', () => {
    const draft = {
      og_image: null,
      template_config: null,
    };
    expect(draftContainsBlacklistedImage(draft)).toBe(false);
  });

  it('should handle drafts with empty images array', () => {
    const draft = {
      og_image: null,
      template_config: {
        images: [],
      },
    };
    expect(draftContainsBlacklistedImage(draft)).toBe(false);
  });
});

describe('findBlacklistedImages', () => {
  it('should find all blacklisted images', () => {
    const draft = {
      og_image: 'https://imgur.com/e8dN5uA',
      template_config: {
        imageUrl: 'https://i.imgur.com/e8dN5uA.jpg',
        images: [
          'https://imgur.com/Safe1',
          'https://i.imgur.com/e8dN5uA.png',
        ],
      },
    };
    const blacklisted = findBlacklistedImages(draft);
    expect(blacklisted).toHaveLength(3);
    expect(blacklisted).toContain('https://imgur.com/e8dN5uA');
    expect(blacklisted).toContain('https://i.imgur.com/e8dN5uA.jpg');
    expect(blacklisted).toContain('https://i.imgur.com/e8dN5uA.png');
  });

  it('should return empty array when no blacklisted images found', () => {
    const draft = {
      og_image: 'https://imgur.com/Safe',
      template_config: {
        imageUrl: 'https://imgur.com/AlsoSafe',
        images: ['https://imgur.com/Safe1', 'https://imgur.com/Safe2'],
      },
    };
    expect(findBlacklistedImages(draft)).toEqual([]);
  });

  it('should handle drafts with no images', () => {
    const draft = {
      og_image: null,
      template_config: null,
    };
    expect(findBlacklistedImages(draft)).toEqual([]);
  });
});
