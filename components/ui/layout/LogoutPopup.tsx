import { Button } from "@/components/shared/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/shared/ui/dialog";
import { LogOut, MessageCircle, Sparkles, Star } from "lucide-react";
import React from "react";

type LogoutPopupProps = {
    open: boolean;
    onClose: () => void;
    onLogout: () => void;
};

const LogoutPopup: React.FC<LogoutPopupProps> = ({ open, onClose, onLogout }) => {
    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md mx-auto">
                <DialogHeader className="text-center pb-6">
                    <div className="relative flex justify-center mb-4">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                        </div>
                        <Sparkles className="h-10 w-10 text-blue-500 relative z-10" />
                    </div>
                    <DialogTitle className="text-center text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-fuchsia-500 to-purple-600 bg-clip-text text-transparent tracking-wide">
                        Ready to Say Goodbye?
                    </DialogTitle>
                    <p className="text-muted-foreground text-base mt-3 text-center italic">
                        Logging out will end your current session.<br />
                        <span className="text-primary font-semibold">We'll miss you!</span>
                    </p>
                    <div className="flex flex-col gap-2 mt-6">
                        <Button
                            onClick={onLogout}
                            className="w-full cursor-pointer bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold shadow-md transition-all duration-200"
                        >
                            <LogOut className="w-5 h-5 mr-2" />
                            Yes, Log me out
                        </Button>
                        <Button
                            onClick={onClose}
                            variant="secondary"
                            className="w-full border border-primary/20 hover:bg-primary/10 text-primary font-medium"
                        >
                            <span role="img" aria-label="stay">🙈</span> Stay Logged In
                        </Button>
                    </div>

                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};

export default LogoutPopup;
