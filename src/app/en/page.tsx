import { permanentRedirect } from "next/navigation";

/**
 * Locale-prefixed URL used by some setups or bookmarks.
 * This app is English-only at the root; send /en → /.
 */
export default function EnLocaleRedirect() {
  permanentRedirect("/");
}
