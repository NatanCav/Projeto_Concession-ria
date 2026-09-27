package com.concessionaria.banner;

import com.concessionaria.banner.dto.BannerRequest;
import com.concessionaria.banner.dto.BannerResponse;
import com.concessionaria.exception.BusinessRuleException;
import com.concessionaria.exception.ResourceNotFoundException;
import com.concessionaria.storage.FileStorageService;
import com.concessionaria.storage.StoredFile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashSet;
import java.util.List;

@Service
@Transactional
public class BannerService {

    private static final String STORAGE_DIRECTORY = "banners";

    private final BannerRepository bannerRepository;
    private final FileStorageService fileStorageService;

    public BannerService(BannerRepository bannerRepository, FileStorageService fileStorageService) {
        this.bannerRepository = bannerRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional(readOnly = true)
    public List<BannerResponse> findActive() {
        return bannerRepository.findByActiveTrueOrderByDisplayOrderAscIdAsc().stream().map(BannerResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<BannerResponse> findAll() {
        return bannerRepository.findAllByOrderByDisplayOrderAscIdAsc().stream().map(BannerResponse::from).toList();
    }

    public BannerResponse create(MultipartFile file, BannerRequest request) {
        Banner banner = new Banner();
        applyRequest(banner, request);
        banner.setDisplayOrder(bannerRepository.findAllByOrderByDisplayOrderAscIdAsc().stream()
                .mapToInt(Banner::getDisplayOrder)
                .max()
                .orElse(-1) + 1);
        StoredFile stored = fileStorageService.store(file, STORAGE_DIRECTORY);
        banner.setImageUrl(stored.publicUrl());
        banner.setStoragePath(stored.relativePath());
        return BannerResponse.from(bannerRepository.save(banner));
    }

    public BannerResponse update(Long id, BannerRequest request) {
        Banner banner = getOrThrow(id);
        applyRequest(banner, request);
        return BannerResponse.from(bannerRepository.save(banner));
    }

    public BannerResponse replaceImage(Long id, MultipartFile file) {
        Banner banner = getOrThrow(id);
        StoredFile stored = fileStorageService.store(file, STORAGE_DIRECTORY);
        String previousPath = banner.getStoragePath();
        banner.setImageUrl(stored.publicUrl());
        banner.setStoragePath(stored.relativePath());
        Banner saved = bannerRepository.save(banner);
        fileStorageService.delete(previousPath);
        return BannerResponse.from(saved);
    }

    public List<BannerResponse> reorder(List<Long> orderedIds) {
        List<Banner> banners = bannerRepository.findAllByOrderByDisplayOrderAscIdAsc();
        if (orderedIds.size() != banners.size()
                || !new HashSet<>(orderedIds).equals(new HashSet<>(banners.stream().map(Banner::getId).toList()))) {
            throw new BusinessRuleException("A lista de reordenação deve conter exatamente os banners cadastrados.");
        }
        for (Banner banner : banners) {
            banner.setDisplayOrder(orderedIds.indexOf(banner.getId()));
        }
        bannerRepository.saveAll(banners);
        return findAll();
    }

    public void delete(Long id) {
        Banner banner = getOrThrow(id);
        bannerRepository.delete(banner);
        fileStorageService.delete(banner.getStoragePath());
    }

    private void applyRequest(Banner banner, BannerRequest request) {
        banner.setTitle(limited(request.title(), 120, "Título"));
        banner.setSubtitle(limited(request.subtitle(), 255, "Subtítulo"));
        banner.setLinkUrl(validatedLink(request.linkUrl()));
        if (request.active() != null) {
            banner.setActive(request.active());
        }
    }

    /** Only site-relative paths or http(s) URLs are accepted, so a banner can never carry a javascript: link. */
    private String validatedLink(String link) {
        String value = limited(link, 500, "Link");
        if (value == null) {
            return null;
        }
        boolean internal = value.startsWith("/") && !value.startsWith("//");
        boolean external = value.startsWith("https://") || value.startsWith("http://");
        if (!internal && !external) {
            throw new BusinessRuleException("O link do banner deve começar com \"/\" (página do site) ou \"https://\".");
        }
        return value;
    }

    private String limited(String value, int maxLength, String field) {
        String normalized = blankToNull(value);
        if (normalized != null && normalized.length() > maxLength) {
            throw new BusinessRuleException(field + " deve ter no máximo " + maxLength + " caracteres.");
        }
        return normalized;
    }

    private String blankToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private Banner getOrThrow(Long id) {
        return bannerRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Banner", id));
    }
}
