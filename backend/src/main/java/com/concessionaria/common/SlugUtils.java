package com.concessionaria.common;

import java.text.Normalizer;
import java.util.regex.Pattern;

public final class SlugUtils {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]+");
    private static final Pattern MULTIPLE_HYPHENS = Pattern.compile("-{2,}");

    private SlugUtils() {
    }

    public static String slugify(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }
        String noWhitespace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(noWhitespace, Normalizer.Form.NFD);
        String stripped = NON_LATIN.matcher(normalized).replaceAll("");
        String collapsed = MULTIPLE_HYPHENS.matcher(stripped).replaceAll("-");
        String result = collapsed.toLowerCase().replaceAll("^-+|-+$", "");
        return result.isBlank() ? "item" : result;
    }
}
