"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function NotificationPreferences() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    wellness: true,
    offers: true,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="w-5 h-5" />
          <span>Notification Preferences</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Email Notifications</Label>
            <p className="text-sm text-gray-600">Receive updates via email</p>
          </div>
          <Switch
            checked={notifications.email}
            onCheckedChange={(checked) =>
              setNotifications({ ...notifications, email: checked })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Push Notifications</Label>
            <p className="text-sm text-gray-600">Mobile app notifications</p>
          </div>
          <Switch
            checked={notifications.push}
            onCheckedChange={(checked) =>
              setNotifications({ ...notifications, push: checked })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Wellness Reminders</Label>
            <p className="text-sm text-gray-600">Health tips and reminders</p>
          </div>
          <Switch
            checked={notifications.wellness}
            onCheckedChange={(checked) =>
              setNotifications({ ...notifications, wellness: checked })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Special Offers</Label>
            <p className="text-sm text-gray-600">Deals and promotions</p>
          </div>
          <Switch
            checked={notifications.offers}
            onCheckedChange={(checked) =>
              setNotifications({ ...notifications, offers: checked })
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
